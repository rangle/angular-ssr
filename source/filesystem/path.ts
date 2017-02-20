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

import {PathException} from 'exception';

export interface Path {
  type: PathType;
  path: string;
  directories(): Set<string>;
  files(): Set<string>;
  traverseUpward(file: string): File;
  dereference(): Path;
}

export const pathFromString = (sourcePath: string): Path => {
  const type = fstype(sourcePath);

  const absolute = (...paths: Array<string>): string => {
    return normalize(join(sourcePath, ...paths));
  };

  const resultingPath = <Path> {
    type,

    path: sourcePath,

    directories(): Set<string> {
      return new Set<string>(readdirSync(sourcePath)
        .filter(item => item !== '.')
        .filter(item => item !== '..')
        .filter(item => fstype(absolute(item)).is(FilesystemType.Directory)));
    },

    files(): Set<string> {
      return new Set<string>(readdirSync(sourcePath)
        .filter(item => item !== '.')
        .filter(item => item !== '..')
        .filter(item => fstype(absolute(item)).is(FilesystemType.File)));
    },

    dereference(): Path {
      if (type.is(FilesystemType.SymbolicLink)) {
        const deref = realpathSync(sourcePath);
        if (deref == null) {
          throw new PathException(`Failed to dereference symlink: ${sourcePath}`);
        }

        return pathFromString(deref);
      }

      return resultingPath;
    },

    traverseUpward(file: string): File {
      for (let from = sourcePath; true; from = join(from, '..')) {
        const candidate = resolve(normalize(join(from, file)));

        if (existsSync(candidate)) {
          return fileFromString(candidate);
        }

        if (resolve(normalize(from)) === resolve(normalize(join(from, '..')))) {
          throw new PathException(`Cannot locate ${file} between ${sourcePath} to ${from}`);
        }
      }
    },
  };

  return resultingPath;
};
