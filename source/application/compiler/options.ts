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

  return {
    angular: ngOptions,
    rootSources: parsed.fileNames,
    ts: adjustOptions(parsed.options),
  };
};

export const adjustOptions = (baseOptions?: CompilerOptions): CompilerOptions => {
  return Object.assign({}, baseOptions, {
    declaration: false,
    sourceMap: false,
    inlineSourceMap: false,
    module: ModuleKind.CommonJS,
    moduleResolution: ModuleResolutionKind.NodeJs,
  });
};
