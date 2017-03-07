import {existsSync} from 'fs';

import {AngularCompilerOptions} from '@angular/tsc-wrapped';

import {Tsc} from '@angular/tsc-wrapped/src/tsc';

import {
  CompilerOptions,
  ModuleKind,
  ModuleResolutionKind
} from 'typescript';

import {Project} from '../project';

import {makeAbsolute} from '../../filesystem';

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
  return Object.assign({}, baseOptions, { // lenient due to nasty ngfactory files
    declaration: false,
    module: ModuleKind.CommonJS,
    moduleResolution: ModuleResolutionKind.NodeJs,
    noUnusedLocals: false,
    noUnusedParameters: false,
    strictNullChecks: false,
    noEmitHelpers: false,
    noImplicitAny: false,
    noImplicitReturns: false,
    noImplicitThis: false,
    noImplicitUseStrict: true,
    noFallthroughCasesInSwitch: false,
  });
};

export const rootDirectories = (basePath: string, options: CompilerOptions): Array<string> => {
  const candidates = [options.rootDir].concat(options.rootDirs || []);

  return candidates.filter(v => v).map(c => makeAbsolute(basePath, c)).filter(c => existsSync(c));
};

const testHeuristic = (filename: string) => /(e2e|\.?(spec|tests?)\.)/.test(filename);