import {Tsc} from '@angular/tsc-wrapped/src/tsc';

import {
  CompilerOptions,
  ModuleKind,
  ModuleResolutionKind
} from 'typescript';

import {CompilableProgram} from './program';

import {Project} from '../project';

import {pathFromString} from '../../filesystem';

export const getCompilableProgram = (project: Project): CompilableProgram => {
  const tsc = new Tsc();

  const {parsed, ngOptions} = tsc.readConfiguration(project.tsconfig, project.basePath);

  ngOptions.basePath = project.basePath;
  ngOptions.generateCodeForLibraries = true;

  if (project.workingPath != null) {
    parsed.options.outDir = project.workingPath.toString();

    ngOptions.outDir = parsed.options.outDir;
  }

  const sources = parsed.fileNames.filter(file => testHeuristic(file) === false);

  const basePath = pathFromString(project.basePath);

  return new CompilableProgram(basePath, adjustOptions(parsed.options), ngOptions, sources);
};

export const adjustOptions = (baseOptions?: CompilerOptions): CompilerOptions => {
  return Object.assign({}, baseOptions, {
    declaration: false,
    module: ModuleKind.CommonJS,
    moduleResolution: ModuleResolutionKind.NodeJs,
    noEmitHelpers: false,
  });
};

const testHeuristic = (filename: string) => /(e2e|\.?(spec|tests?)\.)/.test(filename);