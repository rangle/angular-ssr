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
import {discoverApplicationModule} from '../ast';

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

    const applicationModule =
      this.project.applicationModule
        ? this.project.applicationModule
        : discoverApplicationModule(program);

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

  private getModuleFromSourceFile(filename: string): string {
    const modules = this.emitted.get(filename);
    if (modules == null) {
      return null;
    }
    return modules.find(m => /\.js$/.test(m));
  }
}

const executable = (filename: string) => extname(filename) === '.js';

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
