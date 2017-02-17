import {dirname} from 'path';

import {Project} from 'application';

import {traverseUp} from './path';

export const getApplicationProject = (moduleId: string, moduleSymbol: string): Project => {
  const tsconfig = traverseUp(__dirname, 'tsconfig.json');

  return <Project> {
    basePath: dirname(tsconfig),
    tsconfig,
    rootModule: {
      source: moduleId,
      symbol: moduleSymbol,
    }
  };
};
