import {getTestingTranspilers, transpile} from './transpilers';

export const process = (source: string, path: string, config): string => {
  const module = {filename: path} as any;

  return transpile(getTestingTranspilers(), module, path);
};