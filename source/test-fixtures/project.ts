import {dirname} from 'path';

import {Project} from 'application';

import {pathFromString} from 'filesystem';

export const getApplicationProject = (moduleId: string, moduleSymbol: string): Project => {
  const path = pathFromString(__dirname);

  const tsconfig = path.traverseUpward('tsconfig.json');

  return <Project> {
    basePath: dirname(tsconfig.path),
    tsconfig: tsconfig.path,
    rootModule: {
      source: moduleId,
      symbol: moduleSymbol,
    }
  };
};
