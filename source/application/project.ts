import {PathReference} from '../filesystem';

export interface ApplicationModule {
  source: string;
  symbol: string;
}

export interface Project {
  basePath: string;
  tsconfig: string;
  identifier?: string | number; // application name or index from angular-cli.json, or null
  workingPath?: PathReference;
  applicationModule?: ApplicationModule;
}
