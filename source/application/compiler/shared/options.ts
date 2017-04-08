import {Tsc} from '@angular/tsc-wrapped/src/tsc';

import {AngularCompilerOptions} from '@angular/tsc-wrapped';

import {
  CompilerOptions,
  ModuleResolutionKind,
  ModuleKind,
} from 'typescript';

import {Project} from '../../project';

export interface CompilationOptions {
  ts: CompilerOptions;
  ng: AngularCompilerOptions;
  sources: Array<string>;
}

export const projectToOptions = (project: Project): CompilationOptions => {
  const tsc = new Tsc();

  const {parsed, ngOptions: ng} = tsc.readConfiguration(
    project.tsconfig.toString(),
    project.basePath.toString());

  const ts = adjustOptions(parsed.options);

  ts.declaration = true;
  ng.declaration = true;
  ng.basePath = project.basePath.toString();
  ng.generateCodeForLibraries = true;

  if (project.workingPath != null) {
    ts.outDir = project.workingPath.toString();
    ng.outDir = parsed.options.outDir;
  }

  const sources = parsed.fileNames.filter(file => testHeuristic(file) === false);

  return {ts, ng, sources};
};

const adjustOptions = (baseOptions?: CompilerOptions): CompilerOptions => {
  return Object.assign({}, baseOptions, {
    declaration: true,
    module: ModuleKind.CommonJS,
    moduleResolution: ModuleResolutionKind.NodeJs,
    noEmitHelpers: false,
  });
};

const testHeuristic = (filename: string) => /(e2e|\.?(spec|tests?)\.)/.test(filename);