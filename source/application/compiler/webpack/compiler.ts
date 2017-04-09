import webpack = require('webpack');

import {createProgram} from 'typescript';

import {ApplicationCompiler} from '../compiler';
import {CompilerException} from './../../../exception';
import {ConfigurationLoader} from './config';
import {ModuleLoader} from '../loader';
import {Project} from '../../project';
import {WebpackModuleLoader} from './loader';
import {discoverModules} from '../../static';
import {projectToOptions} from '../shared';

export class WebpackCompiler implements ApplicationCompiler {
  constructor(
    private project: Project,
    private configurationLoader: ConfigurationLoader
  ) {}

  async compile(): Promise<ModuleLoader> {
    const {ts, sources} = projectToOptions(this.project);

    const program = createProgram(sources, ts);

    const modules = discoverModules(this.project.basePath, program);

    const configuration = Object.assign(this.configurationLoader.load(), {entry: modules});

    const compiler = webpack(configuration);

    await callbackToPromise<void>(compiler.run.bind(compiler));

    return new WebpackModuleLoader(configuration);
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