import {PathReference} from '../filesystem';

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
