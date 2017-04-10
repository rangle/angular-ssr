import {Project} from '../../application';

import {
  FileReference,
  PathReference,
  pathFromString,
  pathFromRandomId
} from '../../filesystem';

import {FilesystemException} from '../../exception';

const tsconfigFromPath = (path: PathReference): FileReference => {
  const tsconfig = path.findInAncestor('tsconfig.json');
  if (tsconfig == null) {
    throw new FilesystemException(`Cannot locate tsconfig.json from ${path.toString()}`);
  }
  return tsconfig as FileReference;
}

export const getApplicationRoot = (): PathReference => {
  const path = pathFromString(__dirname);

  const tsconfig = tsconfigFromPath(path);

  return tsconfig.parent();
};

export const getApplicationProject = (moduleId: string, moduleSymbol: string, workingPath?: PathReference): Project => {
  const path = pathFromString(__dirname);

  const tsconfig = tsconfigFromPath(path);

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
