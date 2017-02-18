import {readdirSync} from 'fs';

import {normalize, resolve, join} from 'path';

import {FilesystemType, fstype} from './type';

import {FilesystemException} from '../exception';

export class TraverseFilesystem {
  constructor(private path: string) {
    this.path = resolve(normalize(path));

    if (fstype(this.path) !== FilesystemType.Directory) {
      throw new FilesystemException(`Cannot traverse a path of type ${FilesystemType[fstype(this.path)]}`);
    }
  }

  directories(): Set<string> {
    return new Set<string>(readdirSync(this.path)
      .filter(item => exclude(item) === false)
      .filter(item => fstype(this.absolute(item)) === FilesystemType.Directory));
  }

  files(): Set<string> {
    return new Set<string>(readdirSync(this.path)
      .filter(item => exclude(item) === false)
      .filter(item => (fstype(this.absolute(item)) & FilesystemType.File) !== 0));
  }

  absolute(...paths: Array<string>): string {
    return resolve(normalize(join(this.path, ...paths)));
  }
}

const exclude = (path: string): boolean => path === '.' || path === '..';
