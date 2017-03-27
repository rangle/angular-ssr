import {
  existsSync,
  readdirSync,
  unlinkSync
} from 'fs';

import {
  dirname,
  normalize,
  resolve,
  join,
} from 'path';

const {mkdirSync} = require('mkdir-recursive');

import {FileReference, PathReference} from '../contracts';
import {FileImpl} from './file';
import {FilesystemException} from '../../exception';
import {FileType, typeFromPath} from '../type';
import {FilesystemBaseImpl} from './base';
import {Predicate} from '../../predicate';

export class PathImpl extends FilesystemBaseImpl implements PathReference {
  exists(): boolean {
    return this.type() !== FileType.Unknown;
  }

  directories(predicate?: RegExp | Predicate<PathReference>): Set<PathReference> {
    this.assert();

    const expr = predicate instanceof RegExp ? predicate : null;

    return new Set<PathReference>(readdirSync(this.sourcePath)
      .filter(path => path !== '.')
      .filter(path => path !== '..')
      .filter(path => expr == null || expr.test(path))
      .filter(path => typeFromPath(path) === FileType.Directory)
      .map(path => new PathImpl(normalize(join(this.sourcePath, path))) as PathReference)
      .filter(path => typeof predicate === 'function' ? (<Predicate<PathReference>> predicate)(path) : true));
  }

  files(predicate?: RegExp | Predicate<FileReference>): Set<FileReference> {
    this.assert();

    const expr = predicate instanceof RegExp ? predicate : null;

    const owner = this as PathReference;

    return new Set<FileReference>(readdirSync(this.sourcePath)
      .filter(file => typeFromPath(file) === FileType.File)
      .filter(file => expr == null || expr.test(file))
      .map(item => new FileImpl(owner, normalize(join(this.sourcePath, item))) as FileReference)
      .filter(file => typeof predicate === 'function' ? (<Predicate<FileReference>> predicate)(file) : true));
  }

  mkdir() {
    try {
      mkdirSync(this.toString());
    }
    catch (exception) {
      throw new FilesystemException(`Failed to create path: ${this.toString()}`);
    }
  }

  parent(): PathReference {
    return new PathImpl(dirname(this.sourcePath)) as PathReference;
  }

  findInAncestor(file: string): FileReference {
    this.assert();

    let iterator: string = this.sourcePath;

    while (normalize(iterator) !== normalize(join(iterator, '..'))) { // root
      const candidate = resolve(normalize(join(iterator, file)));

      if (existsSync(candidate)) {
        return new FileImpl(new PathImpl(iterator) as PathReference, candidate);
      }

      iterator = join(iterator, '..');
    }

    throw new FilesystemException(`Cannot locate ${file} between ${this.sourcePath} to ${iterator}`);
  }

  findInChildren(file: string): FileReference {
    const traverse = (node: PathImpl, predicate: Predicate<FileReference>): FileReference => {
      return (
        Array.from(node.files(predicate)).find(v => true) ||
        Array.from(node.directories()).map(v => traverse(v as PathImpl, predicate)).find(() => true));
    }
    return traverse(this, path => path.name() === file);
  }

  unlink() {
    try {
      unlinkSync(this.toString());
    }
    catch (exception) {}
  }

  toString() {
    return this.sourcePath;
  }

  private assert() {
    if (this.exists() === false) {
      throw new FilesystemException(`Assertion failed because path does not exist or is not readable: ${this.sourcePath}`);
    }
  }
}
