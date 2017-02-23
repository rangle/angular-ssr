export interface ApplicationModuleDescriptor {
  source: string;
  symbol: string;
}

export interface Project {
  basePath: string;

  // path to the tsconfig.json file for this project
  tsconfig: string;

  // path to the application root NgModule file, and the name of that module.
  // we will automatically determine this using static analysis if it is not
  // provided, but this will add a bit more time to the compilation process
  applicationModule?: ApplicationModuleDescriptor;
}
