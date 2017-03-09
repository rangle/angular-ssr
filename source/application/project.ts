export interface ApplicationModuleDescriptor {
  source: string;
  symbol: string;
}

export interface Project {
  basePath: string;
  tsconfig: string;
  applicationModule?: ApplicationModuleDescriptor;
}
