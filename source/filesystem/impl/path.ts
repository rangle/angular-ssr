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

import {FilesystemBase, FileReference, PathReference} from '../contracts';
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
      .filter(path => typeFromPath(join(this.sourcePath, path)) === FileType.Directory)
      .map(path => new PathImpl(normalize(join(this.sourcePath, path))) as PathReference)
      .filter(path => typeof predicate === 'function' ? (<Predicate<PathReference>> predicate)(path) : true));
  }

  files(predicate?: RegExp | Predicate<FileReference>): Set<FileReference> {
    this.assert();

    const expr = predicate instanceof RegExp ? predicate : null;

    const owner = this as PathReference;

    return new Set<FileReference>(readdirSync(this.sourcePath)
      .filter(file => typeFromPath(join(this.sourcePath, file)) === FileType.File)
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

  findInAncestor(file: string): FilesystemBase {
    this.assert();

    let iterator: string = this.sourcePath;

    while (normalize(iterator) !== normalize(join(iterator, '..'))) { // root
      const candidate = resolve(normalize(join(iterator, file)));

      if (existsSync(candidate)) {
        switch (typeFromPath(candidate)) {
          case FileType.File:
            return new FileImpl(new PathImpl(iterator) as PathReference, candidate);
          case FileType.Directory:
            return new PathImpl(candidate);
          default:
            return null;
        }
      }

      iterator = join(iterator, '..');
    }

    return null;
  }

  findInChildren(file: string): FileReference {
    const traverse = (node: PathImpl, predicate: Predicate<FileReference>): FileReference => {
      return (
        Array.from(node.files(predicate)).find(v => true) ||
        Array.from(node.directories()).map(v => traverse(v as PathImpl, predicate)).find(() => true));
    }
    return traverse(this, path => path.name() === file);
  }

  findImmediateChild(file: string): FileReference {
    const files = Array.from(this.files());

    return files.find(f => f.name() === file);
  }

  unlink() {
    for (const item of [...Array.from(this.files()), ...Array.from(this.directories())]) {
      item.unlink();
    }

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
