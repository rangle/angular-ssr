import {dirname} from 'path';

import {Project} from '../application';

import {pathFromString} from '../filesystem';

export const getApplicationProject = (moduleId: string, moduleSymbol: string): Project => {
  const path = pathFromString(__dirname);

  const tsconfig = path.traverseUpward('tsconfig.json');

  const tsconfigPath = tsconfig.path();

  return <Project> {
    basePath: dirname(tsconfigPath),
    tsconfig: tsconfigPath,
    rootModule: {
      source: moduleId,
      symbol: moduleSymbol,
    }
  };
};
