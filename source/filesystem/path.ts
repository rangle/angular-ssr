import {
  existsSync,
  readdirSync,
  realpathSync
} from 'fs';

import {
  normalize,
  resolve,
  join
} from 'path';

import {
  FilesystemType,
  PathType,
  fstype
} from './type';

import {File, fileFromString} from './file';

import {PathException} from '../exception';

export const pathFromString = (sourcePath: string): Path => new Path(sourcePath);

export class Path {
  constructor(private sourcePath: string) {}

  type(): PathType {
    return fstype(this.sourcePath);
  }

  exists(): boolean {
    return existsSync(this.dereference().toString()) === true && this.type().is(FilesystemType.Directory);
  }

  directories(): Set<Path> {
    this.assertExistence();

    return new Set<Path>(readdirSync(this.sourcePath)
      .filter(item => item !== '.')
      .filter(item => item !== '..')
      .map(item => pathFromString(normalize(join(this.sourcePath, item))))
      .filter(file => file.type().is(FilesystemType.Directory)));
  }

  files(): Set<File> {
    this.assertExistence();

    return new Set<File>(readdirSync(this.sourcePath)
      .filter(item => item !== '.')
      .filter(item => item !== '..')
      .map(item => fileFromString(normalize(join(this.sourcePath, item))))
      .filter(file => file.type().is(FilesystemType.File)));
  }

  dereference(): Path {
    if (this.type().is(FilesystemType.SymbolicLink)) {
      const deref = realpathSync(this.sourcePath);
      if (deref == null) {
        throw new PathException(`Failed to dereference symlink: ${this.sourcePath}`);
      }
      return pathFromString(deref);
    }
    return this;
  }

  traverseUpward(file: string): File {
    this.assertExistence();

    for (let from = this.sourcePath; true; from = join(from, '..')) {
      const candidate = resolve(normalize(join(from, file)));

      if (existsSync(candidate)) {
        return fileFromString(candidate);
      }

      if (resolve(normalize(from)) === resolve(normalize(join(from, '..')))) {
        throw new PathException(`Cannot locate ${file} between ${this.sourcePath} to ${from}`);
      }
    }
  }

  toString() {
    return this.sourcePath;
  }

  private assertExistence() {
    if (this.exists() === false) {
      throw new PathException(`Cannot traverse a nonexistent path: ${this.sourcePath}`);
    }
  }
}