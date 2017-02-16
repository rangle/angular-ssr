import {existsSync} from 'fs';

import {join, resolve} from 'path';

import {PathException} from '../exception';

export const filesystemSearchUpward = (from: string, file: string): string => {
  const initialPath = from;

  const absolute = (...parts: Array<string>) => resolve(join(from, ...parts));

  while (true) {
    const candidate = absolute(file);

    if (existsSync(candidate) === false) {
      const parent = absolute('..');

      if (from === parent) {
        throw new PathException(`Traversed from ${initialPath} to ${from} and could not find ${file}`);
      }

      from = parent;
    }
    else {
      return candidate;
    }
  }
};
