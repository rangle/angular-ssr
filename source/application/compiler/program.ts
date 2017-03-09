import {NgModuleFactory} from '@angular/core/index';

import {createAotCompiler} from '@angular/compiler/index';

import {
  CompilerHost as AngularCompilerHost,
  NodeCompilerHostContext,
  StaticReflector
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

import {ngModuleDecorator} from '../../identifiers';
import {ApplicationModuleDescriptor} from '../project';
import {CompilerEmitted} from './emitted';
import {CompilerException} from '../../exception';
import {assertDiagnostics} from './diagnostics';
import {discoverApplicationModule} from '../static';

export class CompilableProgram {
  private compilerHost: CompilerHost;

  private program: Program;

  private compilationEmit: CompilerEmitted;

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

  async loadModule<M>(module: ApplicationModuleDescriptor): Promise<NgModuleFactory<M>> {
    module = this.discoverApplicationModule(module);

    if (this.compilationEmit == null) {
      this.compilationEmit = await this.compile();
    }

    const roots = [pathFromString(this.ts.outDir)].concat(this.roots(), this.basePath);

    const [resolvedModule, symbol] = this.compilationEmit.resolve(roots, module);
    if (resolvedModule == null) {
      throw new CompilerException(`Cannot find a module matching the name ${module.source} with a symbol ${module.symbol}`);
    }

    const loadedModule = require(resolvedModule);
    if (loadedModule[symbol] == null) {
      throw new CompilerException(`Module ${module.source} does not contain a symbol named ${symbol}`);
    }

    return loadedModule[symbol];
  }

  private async compile(): Promise<CompilerEmitted> {
    const [host, generated] = await this.generateTemplates();

    const sources = this.program.getSourceFiles().map(sf => sf.fileName).concat(generated);

    const templatedProgram = createProgram(sources, this.ts, host, this.program);

    const emitted = new CompilerEmitted();

    const originalWriteFile = this.compilerHost.writeFile.bind(this.compilerHost);

    const writeFile = (filename: string, data: string, writeByteOrderMark: boolean, onError: (message: string) => void, sourceFiles: Array<SourceFile>) => {
      emitted.emit(filename, sourceFiles);

      return originalWriteFile(filename, data, writeByteOrderMark, onError, sourceFiles);
    };

    const emitResult = templatedProgram.emit(undefined, writeFile);
    if (emitResult) {
      assertDiagnostics(emitResult.diagnostics);
    }

    return emitted;
  }

  private async generateTemplates(): Promise<[CompilerHost, Array<string>]> {
    const hostContext = new NodeCompilerHostContext();

    const hasRoots = this.roots().length > 0;

    const compiler = hasRoots
      ? new PathMappedCompilerHost(this.program, this.ng, hostContext)
      : new AngularCompilerHost(this.program, this.ng, hostContext);

    compiler.getCanonicalFileName = (fileName: string) => {
      return fileName;
    }

    const cli = new NgcCliOptions({
      i18nFormat: null,
      i18nFile: null,
      locale: null,
      basePath: this.ng.basePath
    });

    const generatedModules = await this.generateTemplateCode(compiler, cli);

    const metadataWriter = new MetadataWriterHost(this.compilerHost, this.ng);

    return [metadataWriter, generatedModules];
  }

  private async generateTemplateCode(compilerHost: AngularCompilerHost, cli: NgcCliOptions) {
    const {compiler, reflector} = createAotCompiler(compilerHost, {
      debug: false,
      translations: null, // FIXME(cbond): Load from translation file
      i18nFormat: cli.i18nFormat,
      locale: cli.locale
    });

    patchReflectorToRemoveBrowserModule(reflector);

    const filenames = this.program.getSourceFiles().map(sf => compilerHost.getCanonicalFileName(sf.fileName));

    const generatedModules = await compiler.compileAll(filenames);

    return generatedModules.map(
      generatedModule => {
        const sourceFile = this.program.getSourceFile(generatedModule.srcFileUrl);
        const emitPath = compilerHost.calculateEmitPath(generatedModule.genFileUrl);
        this.compilerHost.writeFile(emitPath, generatedModule.source, false, function () {}, [sourceFile]);
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

const patchReflectorToRemoveBrowserModule = (reflector: StaticReflector) => {
  const originalAnnotations = reflector.annotations.bind(reflector);

  reflector.annotations = type => {
    const original = originalAnnotations(type);

    for (const decorator of original) {
      if (decorator.toString() !== `@${ngModuleDecorator}` ||
          decorator.imports == null ||
          decorator.imports.length === 0) {
        continue;
      }

      const browserIndex = decorator.imports.findIndex(s => s.name === 'BrowserModule');
      if (browserIndex < 0) {
        continue;
      }

      decorator.imports.splice(browserIndex, 1);

      if (decorator.imports.find(i => i.name === 'ApplicationModule') == null) {
        const identifier = reflector.resolveIdentifier('ApplicationModule', '@angular/core/src/application_module');
        decorator.imports.push(identifier);
      }

      if (decorator.imports.find(i => i.name === 'CommonModule') == null) {
        const identifier = reflector.resolveIdentifier('CommonModule', '@angular/common/src/common_module');
        decorator.imports.push(identifier);
      }
    }

    return original;
  };
};
