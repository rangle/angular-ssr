import {readFileSync} from 'fs';

import {FilesystemType} from './type';
import {pathFromString} from './path';
import {FilesystemException} from '../exception';

export interface File {
  path: string;
  content(): string;
}

export const fileFromString = (filePath: string): File => {
  const path = pathFromString(filePath);

  const deref = path.dereference();

  if (deref.type.is(FilesystemType.File) === false) {
    throw new FilesystemException(`Cannot read a file of type ${deref.type.description()}`);
  }

  let cached: string;

  const cacheMiss = () => {
    try {
      cached = readFileSync(deref.path).toString();
      return cached;
    }
    catch (exception) {
      const resolvedFrom = deref !== path ? ` (from symbolic link: ${filePath})` : String();

      throw new FilesystemException(
        `Failed to read file content: ${deref}${resolvedFrom}`, exception);
    }
  };

  return {path: deref.path, content: () => cached || cacheMiss()};
};