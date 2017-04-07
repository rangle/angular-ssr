import {NgModuleFactory} from '@angular/core';
import {AotCompiler, createAotCompiler} from '@angular/compiler';
import {CompilerHost as AngularCompilerHost} from '@angular/compiler-cli';
import {PathMappedCompilerHost} from '@angular/compiler-cli/src/path_mapped_compiler_host';
import {MetadataWriterHost, NgcCliOptions} from '@angular/tsc-wrapped';
import {Tsc} from '@angular/tsc-wrapped/src/tsc';

import {
  CompilerHost,
  CompilerOptions,
  ModuleKind,
  ModuleResolutionKind,
  Program,
  SourceFile,
  createCompilerHost,
  createProgram,
} from 'typescript';

import {
  PathReference,
  makeAbsolute,
  pathFromString,
} from '../../../filesystem';

import {ApplicationCompiler} from '../compiler';
import {ApplicationModule, Project} from '../../project';
import {Build} from './build';
import {CompilerException} from '../../../exception';
import {ModuleLoader} from '../loader';
import {ResourceResolver} from './resource-resolver';
import {assertDiagnostics, assertProgram} from './diagnostics';
import {discoverApplicationModule} from '../../static';

export class NgcCompiler implements ApplicationCompiler {
  constructor(private project: Project) {}

  async compile(): Promise<ModuleLoader> {
    const build = await this.loadAndCompile();

    const roots = [build.outputPath, ...build.roots, this.project.basePath].map(pathFromString);

    const load = (module: ApplicationModule) => {
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
    };

    return {
      load: <M>(): Promise<NgModuleFactory<M>> => {
        return load(this.project.applicationModule);
      },
      lazy: <T>(module: ApplicationModule): Promise<T> => {
        return load(module);
      },
      dispose: () => build.dispose()
    }
  }

  private roots(program: Program): Array<PathReference> {
    const options = program.getCompilerOptions();

    const candidates = [options.rootDir].concat(options.rootDirs || []).filter(v => v);

    return candidates.map(c => pathFromString(makeAbsolute(this.project.basePath, c)));
  }

  private async loadAndCompile(): Promise<Build> {
    const {ts, ng, sources} = generateOptions(this.project);

    const compilerHost = createCompilerHost(ts, true);

    const program = createProgram(sources, ts, compilerHost);

    const hostContext = new ResourceResolver(compilerHost);

    const ngCompilerHost =
      this.roots(program).length > 0
        ? new PathMappedCompilerHost(program, ng, hostContext)
        : new AngularCompilerHost(program, ng, hostContext);

    const cli = new NgcCliOptions({
      i18nFormat: null,
      i18nFile: null,
      locale: null,
      basePath: ng.basePath
    });

    const {compiler} = createAotCompiler(ngCompilerHost, {
      translations: null, // FIXME(bond): Load from translation file
      i18nFormat: cli.i18nFormat,
      locale: cli.locale
    });

    assertProgram(program);

    const build = new Build(this.roots(program), pathFromString(ts.outDir));

    const generatedModules = await this.generateTemplateCode(compilerHost, ngCompilerHost, compiler, program, build);

    const host = new (<any>MetadataWriterHost)(compilerHost, ng, true);

    const canonicalSources = program.getSourceFiles().map(sf => sf.fileName).concat(generatedModules);

    const templatedProgram = createProgram(canonicalSources, ts, host, program);

    const originalWriteFile = compilerHost.writeFile.bind(compilerHost);

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

    this.project.applicationModule = adjustApplicationModule(program, this.project.basePath, this.project.applicationModule);

    return build;
  }

  private async generateTemplateCode(compilerHost: CompilerHost, ngCompilerHost: AngularCompilerHost, compiler: AotCompiler, program: Program, build: Build) {
    const filenames = program.getSourceFiles().map(sf => ngCompilerHost.getCanonicalFileName(sf.fileName));

    const generatedModules = await compiler.compileAll(filenames);

    return generatedModules.map(
      generatedModule => {
        const sourceFile = program.getSourceFile(generatedModule.srcFileUrl);

        const emitPath = ngCompilerHost.calculateEmitPath(generatedModule.genFileUrl);

        compilerHost.writeFile(emitPath, generatedModule.source, false, function () {}, [sourceFile]);

        build.emit(emitPath, [sourceFile]);

        return emitPath;
      });
  }
}

const adjustApplicationModule = (program: Program, basePath: string, module: ApplicationModule): ApplicationModule => {
  const invalid = () =>
    !module ||
    !module.source ||
    !module.symbol;

  if (invalid()) {
    module = discoverApplicationModule(basePath, program);
  }

  if (invalid()) {
    throw new CompilerException(`Cannot discover the source file containing the root application NgModule and the name of the module, please use explicit options`);
  }

  return module;
};

const generateOptions = (project: Project) => {
  const tsc = new Tsc();

  const {parsed, ngOptions} = tsc.readConfiguration(project.tsconfig, project.basePath);

  parsed.options.declaration = true;

  ngOptions.declaration = true;
  ngOptions.basePath = project.basePath;
  ngOptions.generateCodeForLibraries = true;

  if (project.workingPath != null) {
    parsed.options.outDir = project.workingPath.toString();

    ngOptions.outDir = parsed.options.outDir;
  }

  const sources = parsed.fileNames.filter(file => testHeuristic(file) === false);

  return {ts: adjustOptions(parsed.options), ng: ngOptions, sources};
};

const adjustOptions = (baseOptions?: CompilerOptions): CompilerOptions => {
  return Object.assign({}, baseOptions, {
    declaration: true,
    module: ModuleKind.CommonJS,
    moduleResolution: ModuleResolutionKind.NodeJs,
    noEmitHelpers: false,
  });
};

const testHeuristic = (filename: string) => /(e2e|\.?(spec|tests?)\.)/.test(filename);