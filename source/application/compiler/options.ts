import {AngularCompilerOptions} from '@angular/tsc-wrapped';

import {Tsc} from '@angular/tsc-wrapped/src/tsc';

import {
  CompilerOptions,
  ModuleKind,
  ModuleResolutionKind
} from 'typescript';

import {Project} from '../project';

export interface CompileOptions {
  angular: AngularCompilerOptions;

  ts: CompilerOptions;

  rootSources: Array<string>;
}

export const loadProjectOptions = (project: Project): CompileOptions => {
  const tsc = new Tsc();

  const {parsed, ngOptions} = tsc.readConfiguration(project.tsconfig, project.basePath);

  ngOptions.basePath = project.basePath;
  ngOptions.generateCodeForLibraries = true;

  // Test files cannot be included but ng new projects do not exclude them from the
  // build in tsconfig.json files, so we must manually snip them from the root file
  // list. This is really super nasty and it would be great if it weren't necessary.
  const rootSources = parsed.fileNames.filter(file => testHeuristic(file) === false);

  return {
    angular: ngOptions,
    rootSources,
    ts: adjustOptions(parsed.options),
  };
};

export const adjustOptions = (baseOptions?: CompilerOptions): CompilerOptions => {
  return Object.assign({}, baseOptions, {
    declaration: false,
    module: ModuleKind.CommonJS,
    moduleResolution: ModuleResolutionKind.NodeJs,
  });
};

const testHeuristic = (filename: string) => /(e2e|\.?(spec|tests?)\.)/.test(filename);