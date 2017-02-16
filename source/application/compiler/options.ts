import {AngularCompilerOptions} from '@angular/tsc-wrapped';
import {Tsc} from '@angular/tsc-wrapped/src/tsc';

import {ParsedCommandLine} from 'typescript';

import {Project} from '../project';

export interface CompileOptions {
  // TypeScript compiler options
  typescriptOptions: ParsedCommandLine;

  // Angular compiler options
  angularOptions: AngularCompilerOptions;
}

export const loadProjectOptions = (project: Project): CompileOptions => {
  const tsc = new Tsc();

  const {parsed, ngOptions} = tsc.readConfiguration(project.tsconfig, project.basePath);

  ngOptions.basePath = project.basePath;

  return {typescriptOptions: parsed, angularOptions: ngOptions};
};