import {NgModuleFactory} from '@angular/core/index';

import {
  CompilerHost,
  Program,
  createCompilerHost,
  createProgram,
} from 'typescript';

import {CompileOptions, loadProjectOptions} from './options';
import {CompilerException} from '../../exception';
import {CompilerContext} from './compiler-context';
import {CompilerPipeline} from './pipeline';
import {ExecutionContext} from './context';
import {Project} from '../project';
import {compileTemplates} from './compiler-ng';
import {assertProgram, assertDiagnostics} from './diagnostics';

export class Compiler {
  private options: CompileOptions;

  constructor(private project: Project) {
    this.options = loadProjectOptions(project);
  }

  async compile(): Promise<NgModuleFactory<any>> {
    const app = new CompilerPipeline(this.project);

    const context = new ExecutionContext(this.project.basePath);
    try {
      app.modules.subscribe(m => context.module(m.filename, m.moduleId, m.source));
      app.sources.subscribe(s => context.source(s.filename, s.source));

      const [module, symbol] = await this.compileInExecutionContext(context, app);

      return this.requireModule(context, module, symbol);
    }
    finally {
      context.dispose();
    }
  }

  private async compileInExecutionContext(context: ExecutionContext, pipeline: CompilerPipeline): Promise<[string, string]> {
    const compilerHost = createCompilerHost(this.options.ts, true);

    const program = this.createProgram(this.options.rootSources, compilerHost);

    compilerHost.writeFile = (filename, data, writeByteOrderMark, onError?, sourceFiles?) => {
      pipeline.write(filename, data, (sourceFiles || []).filter(sf => sf != null));
    };

    const [metadataWriter, generatedModules] = await compileTemplates(this.options, program, compilerHost);

    const compilerContext = new CompilerContext(this.project, context, metadataWriter, generatedModules);

    const options = compilerContext.options();

    const templatedProgram = this.createProgram(options.fileNames, compilerContext, program);

    const emitResult = templatedProgram.emit(undefined, compilerHost.writeFile, null, false);
    if (emitResult) {
      assertDiagnostics(emitResult.diagnostics);
    }

    return pipeline.rootModule(program, compilerContext, options.options);
  }

  private createProgram(files: Array<string>, compilerHost: CompilerHost, previousProgram?: Program): Program {
    const program = createProgram(files, this.options.ts, compilerHost, previousProgram);
    assertProgram(program);

    return program;
  }

  private async requireModule(context: ExecutionContext, source: string, symbol: string) {
    const requiredModule = context.require(source);

    if (requiredModule[symbol] == null) {
      throw new CompilerException(`Module ${source} does not export a ${symbol} symbol`);
    }

    return requiredModule[symbol];
  }
}