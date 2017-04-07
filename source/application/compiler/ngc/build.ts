import {SourceFile} from 'typescript';

import {join, sep} from 'path';

import {Disposable} from '../../../disposable';
import {PathReference, fileFromString} from '../../../filesystem';
import {ApplicationModule} from '../../project';
import {flatten} from '../../../transformation';

export class Build implements Disposable {
  private map = new Map<string, Array<string>>();

  constructor(
    public readonly roots: Array<PathReference>,
    public readonly outputPath: PathReference
  ) {}

  emit(filename: string, sourceFiles: Array<SourceFile>) {
    if (sourceFiles == null) {
      return;
    }

    for (const sourceFile of sourceFiles.filter(sf => sf != null)) {
      const array = this.sourceArray(sourceFile.fileName);
      array.push(filename);
    }
  }

  resolve(roots: Array<PathReference>, module: ApplicationModule): [string, string] {
    const source = sourceToNgFactory(module.source);
    const symbol = symbolToNgFactory(module.symbol);

    if (source) {
      const candidates = flatten<string>(roots.map(r => [
        join(r.toString(), source),
        join(r.toString(), source.replace(/\//g, sep)),
        join(r.toString(), source.replace(/\\/g, '/')),
        `${r.toString()}/${source}`,
        `${r.toString()}/${source}`.replace(/\//g, sep),
        `${r.toString()}/${source}`.replace(/\\/g, '/')
      ]));

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
    }

    return [null, null];
  }

  dispose() {
    const emitted = flatten<string>(Array.from(this.map.entries()).map(([k, v]) => v));

    for (const file of emitted.map(fileFromString)) {
      file.unlink();
    }

    this.map = new Map<string, Array<string>>();
  }

  private sourceArray(filename: string) {
    if (this.map.has(filename) === false) {
      this.map.set(filename, new Array<string>());
    }
    return this.map.get(filename);
  }
}

const sourceToNgFactory = (source: string): string => {
  if (!source) {
    return source;
  }

  if (/\.ngfactory\.(ts|js)$/.test(source) === false) {
    source = source.replace(/\.(js|ts)$/, String());
    source = source.replace(/\.ngfactory$/, String());

    return /(\\|\/)$/.test(source)
      ? `${source}index.ngfactory.ts`
      : `${source}.ngfactory.ts`;
  }
  return source;
};

const symbolToNgFactory = (symbol: string): string => {
  if (!symbol) {
    return symbol;
  }
  return /NgFactory$/.test(symbol) === false
    ? `${symbol}NgFactory`
    : symbol;
};
