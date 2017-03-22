import {join} from 'path';

import {tmpdir} from 'os';

import {pathFromString, PathReference} from '../filesystem';

import {randomId} from '../identifiers';

export interface ApplicationModuleDescriptor {
  source: string;
  symbol: string;
}

export interface Project {
  basePath: string;
  tsconfig: string;
  workingPath?: PathReference;
  applicationModule?: ApplicationModuleDescriptor;
}

export const getTemporaryWorkingPath = (): PathReference => {
  const path = pathFromString(join(tmpdir(), randomId()));
  path.mkdir();
  return path;
};