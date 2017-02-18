import {readFileSync, realpathSync} from 'fs';

import {FilesystemType, fstype} from './type';

import {FilesystemException} from '../exception';

export const fileContent = (path: string): string => {
  const type = fstype(path);

  if ((type & FilesystemType.File) === 0) {
    throw new FilesystemException(`Cannot read the contents of a ${FilesystemType[type]}, was expecting a file`);
  }

  if ((type & FilesystemType.SymbolicLink) !== 0) { // dereference symlinks
    try {
      path = realpathSync(path);
    }
    catch (exception) {
      throw new FilesystemException(`Failed to dereference symbolic link: ${path}`);
    }
  }

  return readFileSync(path).toString();
};