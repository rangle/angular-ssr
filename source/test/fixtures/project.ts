import {Project} from '../../application';

import {
  PathReference,
  pathFromString,
  pathFromRandomId
} from '../../filesystem';

export const getApplicationRoot = (): PathReference => {
  const path = pathFromString(__dirname);

  const tsconfig = path.findInAncestor('tsconfig.json');

  return tsconfig.parent();
};

export const getApplicationProject = (moduleId: string, moduleSymbol: string, workingPath?: PathReference): Project => {
  const path = pathFromString(__dirname);

  const tsconfig = path.findInAncestor('tsconfig.json');

  return <Project> {
    basePath: tsconfig.parent(),
    tsconfig,
    workingPath: workingPath || pathFromRandomId(),
    applicationModule: {
      source: moduleId,
      symbol: moduleSymbol,
    }
  };
};
