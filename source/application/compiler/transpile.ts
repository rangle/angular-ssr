import {transform} from 'babel-core';

export const transpile = (source: string): string => {
  const {code} = transform(source, {presets: ['es2015']});

  return code;
};
