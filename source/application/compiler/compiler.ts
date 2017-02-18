import {NgModuleFactory} from '@angular/core';

import {
  CompilerHost,
  CompilerOptions,
  Diagnostic,
  ModuleKind,
  ModuleResolutionKind,
  Program,
  WriteFileCallback,
  createCompilerHost,
  createProgram,
  getPreEmitDiagnostics,
} from 'typescript';

import {dirname} from 'path';

import {CompileOptions, loadProjectOptions} from './options';
import {CompilerException} from 'exception';
import {CompilerVmHost} from './compiler-vm-host';
import {Project} from '../project';
import {VirtualMachine} from './vm';
import {diagnosticsToException} from './diagnostics';
import {templateCompiler} from './template';
import {flatten} from 'transformation';

export class Compiler {
  private options: CompileOptions;

  constructor(private project: Project) {
    this.options = loadProjectOptions(project);

    const {rootModule} = project;

    const none = (identifier: string) => identifier == null || identifier.length === 0;

    if (rootModule == null || none(rootModule.source) || none(rootModule.symbol)) {
      throw new CompilerException('Compiler requires a module ID and an export name in ngModule');
    }
  }

  async compile(): Promise<NgModuleFactory<any>> {
    const vm = new VirtualMachine();
    try {
      await this.compileToVm(vm);

      const {source, symbol} = this.project.rootModule;

      // use the compiled template factory, not the jit class
      const requiredModule = vm.require(`${source}.ngfactory`);
      if (requiredModule == null) {
        throw new CompilerException(`Attempted to load ${source}.ngfactory but received a null or undefined object`);
      }

      const factorySymbol =
        /NgFactory$/.test(symbol) === false
          ? `${symbol}NgFactory`
          : `${symbol}`;

      if (requiredModule.hasOwnProperty(factorySymbol) === false) {
        throw new CompilerException(`Module ${source} does not export a ${factorySymbol} symbol`);
      }

      return requiredModule[factorySymbol];
    }
    finally {
      vm.dispose();
    }
  }

  private async compileToVm(vm: VirtualMachine): Promise<void> {
    const compilerHost = createCompilerHost(this.typescriptOptions(), true);

    const options = this.options.typescriptOptions;

    const program = this.createProgram(options.fileNames, options.options, compilerHost);

    const compilerOptions = program.getCompilerOptions();

    const writer: WriteFileCallback =
      (fileName, data, writeByteOrderMark, onError?, sourceFiles?) => {
        try {
          vm.define(fileName, this.moduleIdFromFilename(fileName, compilerOptions), data);
        }
        catch (exception) {
          if (onError == null) {
            throw exception;
          }
          onError(exception.stack);
        }
      };

    compilerHost.writeFile = writer;

    const metadataWriter = await templateCompiler(this.options, program, compilerHost);

    const compilerVmHost = new CompilerVmHost(this.project, vm, metadataWriter);

    const {parsedCommandLine} = compilerVmHost;

    const suboptions = this.typescriptOptions(parsedCommandLine.options);

    const templatedProgram = this.createProgram(parsedCommandLine.fileNames, suboptions, compilerVmHost, program);

    templatedProgram.emit(undefined, writer, null, false);
  }

  private createProgram(files: Array<string>, compilerOptions: CompilerOptions, compilerHost: CompilerHost, previousProgram?: Program): Program {
    const program = createProgram(
      files,
      compilerOptions,
      compilerHost,
      previousProgram);

    this.assertions(program);

    return program;
  }

  private typescriptOptions(baseOptions?: CompilerOptions) {
    const tsoptions = baseOptions || this.options.typescriptOptions.options;

    return Object.assign({}, tsoptions, {
      declaration: false,
      sourceMap: false,
      sourceRoot: null,
      inlineSourceMap: false,
      module: ModuleKind.CommonJS,
      moduleResolution: ModuleResolutionKind.NodeJs,
    });
  }

  private assertions(program: Program) {
    this.conditionalException(program.getOptionsDiagnostics());
    this.conditionalException(program.getGlobalDiagnostics());
    this.conditionalException(flatten<Diagnostic>(program.getSourceFiles().map(file => getPreEmitDiagnostics(program, file))));
  }

  private conditionalException(diagnostics: Array<Diagnostic>) {
    if (diagnostics == null ||
        diagnostics.length === 0) {
      return;
    }
    throw new CompilerException(diagnosticsToException(diagnostics));
  }

  private moduleIdFromFilename(filename: string, compilerOptions: CompilerOptions): string {
    const projectPath = (path: string): string =>
      path.toLowerCase().endsWith('.json')
        ? dirname(path)
        : path;

    const candidates = [
      compilerOptions.baseUrl,
      compilerOptions.outDir,
      compilerOptions.rootDir,
      compilerOptions.project
        ? projectPath(compilerOptions.project)
        : null,
    ].concat(compilerOptions.rootDirs || []).filter(v => v);

    const lowerfile = filename.toLowerCase();

    const matches = candidates.map(v => v.toLowerCase()).filter(p => lowerfile.startsWith(p));
    if (matches.length > 0) {
      return filename.substring(matches[0].length)
        .replace(/\.js$/, String())
        .replace(/^\//, String());
    }

    throw new CompilerException(`Cannot determine module ID of file ${filename}`);
  }
}