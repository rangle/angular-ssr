import {AngularCompilerOptions} from '@angular/tsc-wrapped';

import {Tsc} from '@angular/tsc-wrapped/src/tsc';

import {
  CompilerOptions,
  ModuleKind,
  ModuleResolutionKind
} from 'typescript';

import {normalize, relative} from 'path';

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

export const moduleIdFromFilename = (basePath: string, filename: string, compilerOptions: CompilerOptions): string => {
  const toModule = (returnModuleId: string) => returnModuleId.replace(/\.js$/, String())

  const roots = [
    compilerOptions.outDir,
    compilerOptions.sourceRoot,
    compilerOptions.rootDir,
    ...(compilerOptions.rootDirs || [])
  ].filter(v => v);

  const candidates =
    /^(\\|\/)/.test(filename)
      ? roots
      : roots.map(a => normalize(relative(basePath, a)));

  const lowerfile = filename.toLowerCase();

  const matches = candidates.map(v => v.toLowerCase()).filter(p => lowerfile.startsWith(p));
  if (matches.length > 0) {
    return toModule(filename.substring(matches[0].length + 1));
  }

  return toModule(filename);
};