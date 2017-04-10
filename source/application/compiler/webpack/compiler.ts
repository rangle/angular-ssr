import webpack = require('webpack');

import {sep} from 'path';

import {createProgram} from 'typescript';

import {Provider} from '@angular/core';

import {ApplicationCompiler} from '../compiler';
import {CompilerException} from './../../../exception';
import {ConfigurationLoader} from './config';
import {ModuleLoader} from '../loader';
import {Project} from '../../project';
import {WebpackModuleLoader} from './loader';
import {ServerPlatform, createJitPlatform} from '../../../platform';
import {loadApplicationModule, projectToOptions} from '../options';

export class WebpackCompiler implements ApplicationCompiler {
  constructor(private project: Project, private loader: ConfigurationLoader) {}

  createPlatform(providers: Array<Provider>) {
    return createJitPlatform(providers) as ServerPlatform;
  }

  compile(): Promise<ModuleLoader> {
    const {ts, sources} = projectToOptions(this.project);

    const program = createProgram(sources, ts);

    this.project.applicationModule = loadApplicationModule(
      program,
      this.project.basePath.toString(),
      this.project.applicationModule);

    const entries = {
      [this.project.applicationModule.source]: `.${sep}${this.project.applicationModule.source}.ts`
    };

    const base = this.loader.load(this.project);

    const configuration = Object.assign(base, {
      target: 'node',
      bail: true,
      context: this.project.basePath.toString(),
      devtool: false,
      entry: entries,
      output: {
        path: this.project.workingPath.toString(),
        filename: '[id].js',
        libraryTarget: 'commonjs2'
      },
      externals: [
        '@angular/cli',
        '@angular/common',
        '@angular/compiler',
        '@angular/compiler-cli',
        '@angular/core',
        '@angular/forms',
        '@angular/http',
        '@angular/platform-browser',
        '@angular/router',
        '@angular/tsc-wrapped',
        '@angular/service-worker',
        'zone.js',
        'rxjs',
        function(context, request, callback) {
          if (excludeFromBundle(request)) {
            callback(null, `commonjs ${request.replace(/^.*?(\\|\/)node_modules(\\|\/)/, String())}`);
          }
          else {
            callback();
          }
        },
      ],
      stats: {
        chunks: true,
      },
      plugins: removeProblematicPlugins(base.plugins || [])
    });

    const compiler = webpack(configuration);

    return new Promise<ModuleLoader>((resolve, reject) => {
      compiler.run((error, stats) => {
        if (error) {
          reject(error);
        }
        else if (stats.hasErrors()) {
          reject(new CompilerException(stats.toString()));
        }
        else {
          resolve(new WebpackModuleLoader(this.project, stats['compilation'].chunks));
        }
      });
    });
  }
}

const removeProblematicPlugins = (plugins: Array<any>): Array<any> => {
  const problematic = [
    /commons/i,
    /extracttext/i,
    /html/i,
    /devtool/i,
    /noemit/i
  ];

  return plugins.filter(plugin => {
    if (plugin.constructor === Object) {
      return false;
    }
    if (problematic.some(expr => expr.test(plugin.constructor.name))) {
      return false;
    }
    return true;
  });
};

const excludeFromBundle = (request: string): boolean => {
  return /rxjs/i.test(request) || /observable/i.test(request);
};
