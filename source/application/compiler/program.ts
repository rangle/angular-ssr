import {NgModuleFactory} from '@angular/core';

import {AotCompiler, createAotCompiler} from '@angular/compiler';

import {
  CompilerHost as AngularCompilerHost,
  CompilerHostContext,
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
import {ResourceResolver} from './resource-resolver';
import {assertDiagnostics, assertProgram} from './diagnostics';
import {discoverApplicationModule} from '../static';

export class CompilableProgram implements Disposable {
  private compilerHost: CompilerHost;

  private compiler: AotCompiler;

  private program: Program;

  private ngCompilerHost: AngularCompilerHost;

  private build: Promise<ApplicationBuild>;

  constructor(
    private basePath: PathReference,
    private ts: CompilerOptions,
    private ng: AngularCompilerOptions,
    sources: Array<string>
  ) {
    this.compilerHost = createCompilerHost(this.ts, true);

    this.program = createProgram(sources, this.ts, this.compilerHost);

    const hostContext = new ResourceResolver(this.compilerHost);

    this.ngCompilerHost = this.compilerFactory(hostContext);

    const cli = new NgcCliOptions({
      i18nFormat: null,
      i18nFile: null,
      locale: null,
      basePath: this.ng.basePath
    });

    const {compiler} = createAotCompiler(this.ngCompilerHost, {
      translations: null, // FIXME(cbond): Load from translation file
      i18nFormat: cli.i18nFormat,
      locale: cli.locale
    });

    this.compiler = compiler;
  }

  roots(): Array<PathReference> {
    const options = this.program.getCompilerOptions();

    const candidates = [options.rootDir].concat(options.rootDirs || []).filter(v => v);

    return candidates.map(c => pathFromString(makeAbsolute(this.basePath, c)));
  }

  compile(): Promise<ApplicationBuild> {
    if (this.build == null) {
      this.build = this.runCompile();
    }
    return this.build;
  }

  async loadModule<M>(module: ApplicationModuleDescriptor, discovery?: boolean): Promise<NgModuleFactory<M>> {
    if (discovery == null || discovery === true) {
      module = this.discoverApplicationModule(module);
    }

    const build = await this.compile();

    const roots = [pathFromString(this.ts.outDir)].concat(this.roots(), this.basePath);

    const [resolvedModule, symbol] = build.resolve(roots, module);
    if (resolvedModule == null) {
      throw new CompilerException(`Cannot find a generated NgFactory matching the name ${module.source} with a symbol ${module.symbol}`);
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

  async dispose() {
    this.compilerHost = undefined;

    if (this.build) {
      this.build.then(b => b.dispose());
    }
  }

  private async runCompile(): Promise<ApplicationBuild> {
    assertProgram(this.program);

    const build = new ApplicationBuild();

    const [host, generated] = await this.generateTemplates(build);

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
      build.emit(filename, sourceFiles);

      return originalWriteFile(filename, data, writeByteOrderMark, onError, sourceFiles);
    };

    const emitResult = templatedProgram.emit(undefined, writeFile);
    if (emitResult) {
      assertDiagnostics(emitResult.diagnostics);
    }

    return build;
  }

  private async generateTemplates(build: ApplicationBuild): Promise<[CompilerHost, Array<string>]> {
    const generatedModules = await this.generateTemplateCode(build);

    const metadataWriter = new (<any>MetadataWriterHost)(this.compilerHost, this.ng, true);

    return [metadataWriter, generatedModules];
  }

  private compilerFactory(context: CompilerHostContext): AngularCompilerHost {
    const hasRoots = this.roots().length > 0;

    if (hasRoots) {
      return new PathMappedCompilerHost(this.program, this.ng, context);
    }

    return new AngularCompilerHost(this.program, this.ng, context);
  }

  private async generateTemplateCode(build: ApplicationBuild) {
    const filenames = this.program.getSourceFiles().map(sf => this.ngCompilerHost.getCanonicalFileName(sf.fileName));

    const generatedModules = await this.compiler.compileAll(filenames);

    return generatedModules.map(
      generatedModule => {
        const sourceFile = this.program.getSourceFile(generatedModule.srcFileUrl);

        const emitPath = this.ngCompilerHost.calculateEmitPath(generatedModule.genFileUrl);

        this.compilerHost.writeFile(emitPath, generatedModule.source, false, function () {}, [sourceFile]);

        build.emit(emitPath, [sourceFile]);

        return emitPath;
      });
  }

  private discoverApplicationModule(module: ApplicationModuleDescriptor): ApplicationModuleDescriptor {
    const invalid = () =>
      !module ||
      !module.source ||
      !module.symbol;

    if (invalid()) {
      module = discoverApplicationModule(this.basePath.toString(), this.program);
    }

    if (invalid()) {
      throw new CompilerException(`Cannot discover the source file containing the root application NgModule and the name of the module, please use explicit options`);
    }

    return module;
  }
}
