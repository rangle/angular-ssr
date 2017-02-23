import {
  CompilerHost,
  CompilerOptions,
  Program,
  SourceFile,
  resolveModuleName
} from 'typescript';

import {
  join,
  normalize,
  resolve
} from 'path';

import {CompilerException} from '../../exception';
import {ApplicationModuleDescriptor, Project} from '../../application';
import {Publisher} from '../../publisher';
import {StaticAnalyzer} from '../static';

export type CompiledSource = {filename: string, source: string};

export type CompiledModule = CompiledSource & {moduleId: string};

export class CompilationEmit {
  constructor(private project: Project) {}

  modules = new Publisher<(module: CompiledModule) => void>();

  sources = new Publisher<(source: CompiledSource) => void>();

  private emitted = new Map<string, Array<string>>();

  write(filename: string, source: string, sourceFiles?: Array<SourceFile>) {
    filename = this.absoluteProjectPath(filename);

    for (const sourceFile of sourceFiles || []) {
      this.map(sourceFile, filename);
    }

    if (executable(filename)) {
      this.modules.publish({
        filename,
        source,
        moduleId: filename.replace(/\.js$/, String())
      });
    }
    else {
      this.sources.publish({filename, source});
    }
  }

  applicationModule(program: Program): ApplicationModuleDescriptor {
    const parser = new StaticAnalyzer(program.getSourceFiles());

    return parser.getBootstrapModule();
  }

  rootModule(program: Program, compilerHost: CompilerHost, options: CompilerOptions): [string, string] {
    const containingFile = join(this.project.basePath, 'index.ts');

    const applicationModule =
      this.project.applicationModule
        ? this.project.applicationModule
        : this.applicationModule(program);

    if (applicationModule == null ||
        applicationModule.source == null ||
        applicationModule.symbol == null) {
      throw new CompilerException(`Cannot find application root @NgModule, please provide in Project structure`);
    }

    const rootModule = sourceToNgFactory(applicationModule.source);

    const resolved = resolveModuleName(rootModule, containingFile, options, compilerHost);

    if (resolved == null ||
        resolved.resolvedModule == null) {
      throw new CompilerException(`Cannot resolve root module: ${rootModule}`);
    }

    const moduleFile = this.getModuleFromSourceFile(resolved.resolvedModule.resolvedFileName);

    const symbol = symbolToNgFactory(applicationModule.symbol);

    return [moduleFile, symbol];
  }

  private map(sourceFile: SourceFile, outputFile: string) {
    let array = this.emitted.get(sourceFile.fileName);
    if (array == null) {
      this.emitted.set(sourceFile.fileName, [outputFile]);
    }
    else {
      array.push(outputFile);
    }
  }

  private getModuleFromSourceFile(filename: string): string {
    const modules = this.emitted.get(filename);
    if (modules == null) {
      return null;
    }
    return modules.find(m => /\.js$/.test(m));
  }

  private absoluteProjectPath(filename: string): string {
    return /^\.\.(\\|\/)/.test(filename)
      ? resolve(normalize(join(this.project.basePath, filename)))
      : filename;
  }
}

const executable = (filename: string) => /\.js$/.test(filename);

const sourceToNgFactory = (source: string): string => {
  if (/\.ngfactory(\.(ts|js))?$/.test(source) === false) {
    return `${source.replace(/\.(js|ts)$/, String())}.ngfactory`;
  }
  return source;
};

const symbolToNgFactory = (symbol: string): string => {
  if (/NgFactory$/.test(symbol) === false) {
    return `${symbol}NgFactory`;
  }
  return symbol;
};
