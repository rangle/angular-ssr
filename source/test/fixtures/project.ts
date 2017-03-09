import {dirname, join} from 'path';

import {tmpdir} from 'os';

import {Project} from '../../application';
import {PathReference, pathFromString} from '../../filesystem';

export const getApplicationProject = (moduleId: string, moduleSymbol: string, workingPath?: PathReference): Project => {
  const path = pathFromString(__dirname);

  const tsconfig = path.findInAncestor('tsconfig.json');

  const tsconfigPath = tsconfig.toString();

  return <Project> {
    basePath: dirname(tsconfigPath),
    tsconfig: tsconfigPath,
    workingPath,
    applicationModule: {
      source: moduleId,
      symbol: moduleSymbol,
    }
  };
};

const randomId = (): string => Math.random().toString(16).slice(2);

export const getTemporaryWorkingPath = (): PathReference => {
  const path = pathFromString(join(tmpdir(), randomId()));
  path.mkdir();
  return path;
}