import {dirname} from 'path';

import {Project, getTemporaryWorkingPath} from '../../application';

import {PathReference, pathFromString} from '../../filesystem';

export const getApplicationProject = (moduleId: string, moduleSymbol: string, workingPath?: PathReference): Project => {
  const path = pathFromString(__dirname);

  const tsconfig = path.findInAncestor('tsconfig.json');

  const tsconfigPath = tsconfig.toString();

  return <Project> {
    basePath: dirname(tsconfigPath),
    tsconfig: tsconfigPath,
    workingPath: workingPath || getTemporaryWorkingPath(),
    applicationModule: {
      source: moduleId,
      symbol: moduleSymbol,
    }
  };
};
