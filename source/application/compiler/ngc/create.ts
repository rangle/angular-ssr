import {
  AotCompiler,
  StaticReflector,
  createAotCompiler
} from '@angular/compiler';

import {CompilerHost as NgCompilerHost} from '@angular/compiler-cli';

import {PathMappedCompilerHost} from '@angular/compiler-cli/src/path_mapped_compiler_host';

import {AngularCompilerOptions, NgcCliOptions} from '@angular/tsc-wrapped';

import {CompilerHost, Program} from 'typescript';

import {PathReference} from '../../../filesystem';

import {ResourceResolver} from './resource-resolver';

export interface CompilerInstance {
  compiler: AotCompiler;
  reflector: StaticReflector;
  host: NgCompilerHost;
}

export const createNgCompiler = (compilerHost: CompilerHost, program: Program, options: AngularCompilerOptions, roots: Array<PathReference>): CompilerInstance => {
  const host = createCompilerHost(compilerHost, roots, program, options);

  const cli = new NgcCliOptions({
    i18nFormat: null,
    i18nFile: null,
    locale: null,
    basePath: options.basePath
  });

  const {compiler, reflector} = createAotCompiler(host, {
    translations: null,
    i18nFormat: cli.i18nFormat,
    locale: cli.locale
  });

  return {compiler, reflector, host};
};

const createCompilerHost = (compilerHost: CompilerHost, roots: Array<PathReference>, program: Program, options: AngularCompilerOptions) =>
  roots.length > 0
    ? new PathMappedCompilerHost(program, options, new ResourceResolver(compilerHost))
    : new NgCompilerHost(program, options, new ResourceResolver(compilerHost));
