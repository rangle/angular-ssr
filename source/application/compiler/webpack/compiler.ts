import webpack = require('webpack');

import {createProgram} from 'typescript';

import {ApplicationCompiler} from '../compiler';
import {CompilerException} from './../../../exception';
import {ModuleLoader} from '../loader';
import {Project} from '../../project';
import {WebpackLoader} from './loader';
import {discoverModules} from '../../static';
import {projectToOptions} from '../shared';

export class WebpackCompiler implements ApplicationCompiler {
  constructor(
    private project: Project,
    private configuration: webpack.Configuration
  ) {}

  async compile(): Promise<ModuleLoader> {
    const {ts, sources} = projectToOptions(this.project);

    const program = createProgram(sources, ts);

    const modules = discoverModules(this.project.basePath, program);

    const configuration = Object.assign({}, this.configuration, {entry: modules});

    const compiler = webpack(configuration);

    await callbackToPromise<void>(compiler.run);

    return new WebpackLoader(this.configuration);
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