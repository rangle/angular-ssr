import {SourceFile} from 'typescript';

import {join, sep} from 'path';

import {Disposable} from '../../../disposable';
import {PathReference, fileFromString} from '../../../filesystem';
import {ModuleDeclaration} from '../../project';
import {flatten} from '../../../transformation';

export class Build implements Disposable {
  private readonly map = new Map<string, Array<string>>();

  constructor(
    public readonly basePath: PathReference,
    public readonly outputPaths: Array<PathReference>,
    public readonly roots: Array<PathReference>
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

  resolveCandidates(source: string): string | null {
    const roots = [...this.roots, ...this.outputPaths, this.basePath];

    const candidates = flatten<string>(roots.map(r => [
      `${join(r.toString(), source)}`,
      `${join(r.toString(), source.replace(/\//g, sep))}`,
      `${join(r.toString(), source.replace(/\\/g, '/'))}`,
      `${r.toString()}/${source}`,
      `${r.toString()}/${source}`.replace(/\//g, sep),
      `${r.toString()}/${source}`.replace(/\\/g, '/')
    ]));

    for (const candidate of candidates) {
      const array = this.map.get(candidate);
      if (array) {
        return candidate;
      }
    }

    return null;
  }

  resolve(module: ModuleDeclaration): [string | null, string | null] {
    const unreachable: [string | null, string | null] = [null, null];

    const sourceFile = this.resolveCandidates(bareSource(module.source));
    if (sourceFile == null) {
      return unreachable;
    }

    const generated = this.map.get(sourceFile) || [];

    const factory = generated.find(file => /\.ngfactory\.ts$/.test(file));
    if (factory == null) {
      return unreachable;
    }

    const js = this.map.get(factory);
    if (js == null) {
      return unreachable;
    }

    const jsfactory = js.find(file => /\.ngfactory\.js$/.test(file));
    if (jsfactory) {
      return [jsfactory, symbolToNgFactory(module.symbol)];
    }

    return unreachable;
  }

  dispose() {
    const emitted = flatten<string>(Array.from(this.map.entries()).map(([k, v]) => v));

    for (const file of emitted.map(fileFromString)) {
      file.unlink();
    }

    this.map.clear();
  }

  private sourceArray(filename: string): Array<string> {
    let value = this.map.get(filename);
    if (value == null) {
      value = new Array<string>();
      this.map.set(filename, value);
    }
    return value;
  }
}

const bareSource = (source: string): string => {
  if (!source) {
    return source;
  }

  if (/\.ngfactory\.(ts|js)$/i.test(source) === false) {
    source = source.replace(/\.(js|ts)$/, String());
    source = source.replace(/\.ngfactory$/, String());

    return /(\\|\/)$/.test(source)
      ? `${source}index.ts`
      : `${source}.ts`;
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
