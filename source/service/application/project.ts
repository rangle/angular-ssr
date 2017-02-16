export interface Project {
  // project root path
  basePath: string;

  // path to the tsconfig.json file for this project
  tsconfig: string;

  // path to the application root NgModule, and the name of that module
  ngModule: [string, string];
}
