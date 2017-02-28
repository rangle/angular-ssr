import {dirname} from 'path';

import {Project} from '../../application';

import {pathFromString} from '../../filesystem';

export const getApplicationProject = (moduleId: string, moduleSymbol: string): Project => {
  const path = pathFromString(__dirname);

  const tsconfig = path.findInAncestor('tsconfig.json');

  const tsconfigPath = tsconfig.toString();

  return <Project> {
    basePath: dirname(tsconfigPath),
    tsconfig: tsconfigPath,
    applicationModule: {
      source: moduleId,
      symbol: moduleSymbol,
    }
  };
};
