import {dirname, join} from 'path';

import {PathReference, FileReference} from './contracts';

import {FileImpl} from './file';
import {PathImpl} from './path';

export const pathFromString = (sourcePath: string): PathReference =>
  new PathImpl(sourcePath) as PathReference;

export const fileFromString = (filePath: string): FileReference =>
  new FileImpl(pathFromString(dirname(filePath)), filePath) as FileReference;

export const makeAbsolute = (basePath: string | PathReference, subpath: string): string =>
  /^\.\.(\\|\/)/.test(subpath)
    ? join(basePath.toString(), subpath)
    : subpath;

export const absolutePath = (basePath: string | PathReference, subpath: string) =>
  pathFromString(makeAbsolute(basePath.toString(), subpath));

export const absoluteFile = (basePath: string | PathReference, subpath: string) =>
  fileFromString(makeAbsolute(basePath.toString(), subpath));
