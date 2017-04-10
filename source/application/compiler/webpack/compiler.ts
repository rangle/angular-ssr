import webpack = require('webpack');

import {createProgram} from 'typescript';

import {Provider} from '@angular/core';

import {ApplicationCompiler} from '../compiler';
import {CompilerException} from './../../../exception';
import {ConfigurationLoader} from './config';
import {ModuleLoader} from '../loader';
import {Project} from '../../project';
import {WebpackModuleLoader} from './loader';
import {collectModules} from '../../static';
import {ServerPlatform, createJitPlatform} from '../../../platform';
import {loadApplicationModule, projectToOptions} from '../options';

export class WebpackCompiler implements ApplicationCompiler {
  constructor(private project: Project, private loader: ConfigurationLoader) {}

  createPlatform(providers: Array<Provider>) {
    return createJitPlatform(providers) as ServerPlatform;
  }

  async compile(): Promise<ModuleLoader> {
    const {ts, sources} = projectToOptions(this.project);

    const program = createProgram(sources, ts);

    this.project.applicationModule = loadApplicationModule(
      program,
      this.project.basePath.toString(),
      this.project.applicationModule);

    const entries = collectModules(this.project.basePath, program)
      .reduce((p, c) => Object.assign(p, {[c.source]: c.source}), {});

    const base = this.loader.load(this.project);

    const configuration = Object.assign(base, {
      target: 'node',
      context: this.project.basePath.toString(),
      entry: entries,
      output: {
        path: this.project.workingPath.toString(),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
      },
      externals: [
        '@angular/cli',
        '@angular/common',
        '@angular/compiler',
        '@angular/compiler-cli',
        '@angular/core',
        '@angular/http',
        '@angular/platform-browser',
        '@angular/router',
        '@angular/tsc-wrapped',
        '@angular/service-worker',
      ]
    });

    const compiler = webpack(configuration);

    await callbackToPromise<void>(compiler.run.bind(compiler));

    return new WebpackModuleLoader(this.project, configuration);
  }
}

const callbackToPromise = <T>(fn: (callback: (err, stats) => void) => void): Promise<T> => {
  return new Promise((resolve, reject) => {
    fn((error, stats) => {
      if (error) {
        reject(error);
      }
      else if (stats.hasErrors()) {
        reject(new CompilerException(stats.toString()));
      }
      else {
        resolve(void 0);
      }
    });
  });
};