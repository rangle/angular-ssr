export interface Project {
  // project root path
  basePath: string;

  // path to the tsconfig.json file for this project
  tsconfig: string;

  // path to the application root NgModule file, and the name of that module
  rootModule: {
    source: string;
    symbol: string;
  }
}
