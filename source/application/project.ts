import {FileReference, PathReference} from '../filesystem';

export interface ModuleDeclaration {
  source: string;
  symbol: string;
}

export interface Project {
  basePath: PathReference;
  tsconfig: FileReference;
  identifier?: string | number; // application name or index from angular-cli.json, or null
  webpack?: FileReference; // optional webpack configuration
  workingPath?: PathReference;
  applicationModule?: ModuleDeclaration;
}
