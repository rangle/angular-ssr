import {join} from 'path';

import {tmpdir} from 'os';

import {pathFromString, PathReference} from '../filesystem';

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

const randomId = (): string => Math.random().toString(16).slice(2);

export const getTemporaryWorkingPath = (): PathReference => {
  const path = pathFromString(join(tmpdir(), randomId()));
  path.mkdir();
  return path;
};