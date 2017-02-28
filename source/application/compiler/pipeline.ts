import {
  CompilerHost,
  CompilerOptions,
  Program,
  SourceFile,
  resolveModuleName
} from 'typescript';

import {extname, join} from 'path';

import {CompilerException} from '../../exception';
import {Project} from '../../application';
import {Publisher} from '../../publisher';
import {makeAbsolute} from '../../filesystem';
import {discoverApplicationModule} from '../static';

export type CompiledSource = {filename: string, source: string};

export type CompiledModule = CompiledSource & {moduleId: string};

export class CompilerPipeline {
  constructor(private project: Project) {}

  modules = new Publisher<(module: CompiledModule) => void>();

  sources = new Publisher<(source: CompiledSource) => void>();

  private emitted = new Map<string, Array<string>>();

  write(filename: string, source: string, sourceFiles?: Array<SourceFile>) {
    filename = makeAbsolute(this.project.basePath, filename);

    for (const sourceFile of sourceFiles || []) {
      let array = this.emitted.get(sourceFile.fileName);
      if (array == null) {
        this.emitted.set(sourceFile.fileName, array = []);
      }
      array.push(filename);
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

  rootModule(program: Program, compilerHost: CompilerHost, options: CompilerOptions): [string, string] {
    const containingFile = join(this.project.basePath, 'index.ts');

    const invalid = () =>
      applicationModule == null ||
      applicationModule.source == null ||
      applicationModule.symbol == null;

    var applicationModule = this.project.applicationModule;
    if (invalid()) {
      applicationModule = discoverApplicationModule(program);
    }
    if (invalid()) {
      throw new CompilerException(`Cannot locate root @NgModule with static analysis (please name them explicitly)`);
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

  private getModuleFromSourceFile(filename: string): string {
    const modules = this.emitted.get(filename);
    if (modules == null) {
      return null;
    }
    return modules.find(m => /\.js$/.test(m));
  }
}

const executable = (filename: string) => extname(filename) === '.js';

const sourceToNgFactory = (source: string): string =>
  /\.ngfactory(\.(ts|js))?$/.test(source) === false
    ? `${source.replace(/\.(js|ts)$/, String())}.ngfactory`
    : source;

const symbolToNgFactory = (symbol: string): string =>
  /NgFactory$/.test(symbol) === false
    ? `${symbol}NgFactory`
    : symbol;
