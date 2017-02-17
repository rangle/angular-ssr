import {existsSync} from 'fs';

import {join, resolve} from 'path';

export const traverseUp = (from: string, file: string): string => {
  const absolute = (...parts: Array<string>) => resolve(join(from, ...parts));

  while (true) {
    const candidate = absolute(file);

    if (existsSync(candidate)) {
      return candidate;
    }

    from = absolute('..');
  }
};
