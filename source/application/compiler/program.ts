import {NgModuleFactory} from '@angular/core';

import {createAotCompiler} from '@angular/compiler';

import {
  CompilerHost as AngularCompilerHost,
  CompilerHostContext,
  NodeCompilerHostContext,
} from '@angular/compiler-cli';

import {PathMappedCompilerHost} from '@angular/compiler-cli/src/path_mapped_compiler_host';

import {
  AngularCompilerOptions,
  MetadataWriterHost,
  NgcCliOptions,
} from '@angular/tsc-wrapped';

import {
  CompilerHost,
  CompilerOptions,
  Program,
  SourceFile,
  createCompilerHost,
  createProgram,
} from 'typescript';

import {
  PathReference,
  makeAbsolute,
  pathFromString,
} from '../../filesystem';

import {ApplicationModuleDescriptor} from '../project';
import {ApplicationBuild} from './build';
import {CompilerException} from '../../exception';
import {Disposable} from '../../disposable';
import {assertDiagnostics} from './diagnostics';
import {discoverApplicationModule} from '../static';

export class CompilableProgram implements Disposable {
  private compilerHost: CompilerHost;

  private program: Program;

  private build: ApplicationBuild;

  constructor(
    private basePath: PathReference,
    private ts: CompilerOptions,
    private ng: AngularCompilerOptions,
    sources: Array<string>
  ) {
    this.compilerHost = createCompilerHost(this.ts, true);

    this.program = createProgram(sources, this.ts, this.compilerHost);
  }

  roots(): Array<PathReference> {
    const options = this.program.getCompilerOptions();

    const candidates = [options.rootDir].concat(options.rootDirs || []).filter(v => v);

    return candidates.map(c => pathFromString(makeAbsolute(this.basePath, c)));
  }

  async loadModule<M>(module: ApplicationModuleDescriptor, discovery?: boolean): Promise<NgModuleFactory<M>> {
    if (discovery == null || discovery === true) {
      module = this.discoverApplicationModule(module);
    }

    await this.demandCompile();

    const roots = [pathFromString(this.ts.outDir)].concat(this.roots(), this.basePath);

    const [resolvedModule, symbol] = this.build.resolve(roots, module);
    if (resolvedModule == null) {
      throw new CompilerException(`Cannot find a module matching the name ${module.source} with a symbol ${module.symbol}`);
    }

    const loadedModule = require(resolvedModule);
    if (symbol) {
      if (loadedModule[symbol] == null) {
        throw new CompilerException(`Module ${module.source} does not contain a symbol named ${symbol}`);
      }
      return loadedModule[symbol];
    }
    return loadedModule;
  }

  dispose() {
    if (this.build) {
      this.build.dispose();
      this.build = undefined;
    }
  }

  private async demandCompile(): Promise<void> {
    if (this.build == null) {
      try {
        await this.compile();
      }
      catch (exception) {
        this.build.dispose();
        this.build = undefined;

        throw new CompilerException(`Compilation failed: ${exception}`, exception);
      }
    }
  }

  private async compile(): Promise<void> {
    this.build = new ApplicationBuild();

    const [host, generated] = await this.generateTemplates();

    const sources = this.program.getSourceFiles().map(sf => sf.fileName).concat(generated);

    const templatedProgram = createProgram(sources, this.ts, host, this.program);

    const originalWriteFile = this.compilerHost.writeFile.bind(this.compilerHost);

    const writeFile = (
        filename: string,
        data: string,
        writeByteOrderMark: boolean,
        onError: (message: string) => void,
        sourceFiles: Array<SourceFile>
    ) => {
      this.build.emit(filename, sourceFiles);

      return originalWriteFile(filename, data, writeByteOrderMark, onError, sourceFiles);
    };

    const emitResult = templatedProgram.emit(undefined, writeFile);
    if (emitResult) {
      assertDiagnostics(emitResult.diagnostics);
    }
  }

  private async generateTemplates(): Promise<[CompilerHost, Array<string>]> {
    const hostContext = new NodeCompilerHostContext();

    const compiler = this.compilerFactory(hostContext);

    const cli = new NgcCliOptions({
      i18nFormat: null,
      i18nFile: null,
      locale: null,
      basePath: this.ng.basePath
    });

    const generatedModules = await this.generateTemplateCode(compiler, cli);

    const metadataWriter = new MetadataWriterHost(this.compilerHost, this.ng, true);

    return [metadataWriter, generatedModules];
  }

  private compilerFactory(context: CompilerHostContext): AngularCompilerHost {
    const hasRoots = this.roots().length > 0;

    if (hasRoots) {
      return new PathMappedCompilerHost(this.program, this.ng, context);
    }

    return new AngularCompilerHost(this.program, this.ng, context);
  }

  private async generateTemplateCode(compilerHost: AngularCompilerHost, cli: NgcCliOptions) {
    const {compiler} = createAotCompiler(compilerHost, {
      translations: null, // FIXME(cbond): Load from translation file
      i18nFormat: cli.i18nFormat,
      locale: cli.locale
    });

    const filenames = this.program.getSourceFiles().map(sf => compilerHost.getCanonicalFileName(sf.fileName));

    const generatedModules = await compiler.compileAll(filenames);

    return generatedModules.map(
      generatedModule => {
        const sourceFile = this.program.getSourceFile(generatedModule.srcFileUrl);

        const emitPath = compilerHost.calculateEmitPath(generatedModule.genFileUrl);

        this.compilerHost.writeFile(emitPath, generatedModule.source, false, function () {}, [sourceFile]);

        this.build.emit(emitPath, [sourceFile]);

        return emitPath;
      });
  }

  private discoverApplicationModule(module: ApplicationModuleDescriptor): ApplicationModuleDescriptor {
    const invalid = () =>
      module == null ||
      module.source == null ||
      module.symbol == null;

    if (invalid()) {
      module = discoverApplicationModule(this.basePath.toString(), this.program);
    }

    if (invalid()) {
      throw new CompilerException(`Cannot discover the source file containing the root application NgModule and the name of the module, please use explicit options`);
    }

    return module;
  }
}
