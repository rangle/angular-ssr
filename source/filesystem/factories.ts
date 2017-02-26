import {dirname, join} from 'path';

import {PathReference, FileReference} from './contracts';

import {FileImpl} from './file';
import {PathImpl} from './path';

export const pathFromString = (sourcePath: string): PathReference =>
  new PathImpl(sourcePath) as PathReference;

export const fileFromString = (filePath: string): FileReference =>
  new FileImpl(pathFromString(dirname(filePath)), filePath) as FileReference;

export const absolutePath = (basePath: string, filename: string) => {
  return /^\.\.(\\|\/)/.test(filename)
    ? fileFromString(join(basePath, filename))
    : fileFromString(filename);
};
