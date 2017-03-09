import {SourceFile} from 'typescript';

import {join, normalize} from 'path';

import {PathReference} from '../../filesystem';

import {ApplicationModuleDescriptor} from './../project';

export class CompilerEmitted {
  private map = new Map<string, Array<string>>();

  emit(filename: string, sourceFiles: Array<SourceFile>) {
    if (sourceFiles == null) {
      return;
    }

    for (const sourceFile of sourceFiles) {
      const array = this.sourceArray(sourceFile.fileName);
      array.push(filename);
    }
  }

  resolve(roots: Array<PathReference>, module: ApplicationModuleDescriptor): [string, string] {
    const source = sourceToNgFactory(module.source);
    const symbol = symbolToNgFactory(module.symbol);

    const candidates = roots.map(r => normalize(join(r.toString(), source)));

    for (const candidate of candidates) {
      const array = this.map.get(candidate);
      if (array == null) {
        continue;
      }

      const ngfactory = array.find(f => /\.ngfactory\.js$/.test(f));
      if (ngfactory) {
        return [ngfactory, symbol];
      }
    }

    return [null, null];
  }

  private sourceArray(filename: string) {
    if (this.map.has(filename) === false) {
      this.map.set(filename, new Array<string>());
    }
    return this.map.get(filename);
  }
}

const sourceToNgFactory = (source: string): string => {
  if (/\.ngfactory\.(ts|js)$/.test(source) === false) {
    source = source.replace(/\.(js|ts)$/, String());
    source = source.replace(/\.ngfactory$/, String());

    return /(\\|\/)$/.test(source)
      ? `${source}index.ngfactory.ts`
      : `${source}.ngfactory.ts`;
  }
  return source;
};

const symbolToNgFactory = (symbol: string): string =>
  /NgFactory$/.test(symbol) === false
    ? `${symbol}NgFactory`
    : symbol;