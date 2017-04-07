import webpack = require('webpack');

const {CliConfig} = require('@angular/cli/models/config');

const {NgCliWebpackConfig} = require('@angular/cli/models/webpack-config');

import {ApplicationCompiler} from '../compiler';
import {CompilerException} from '../../../exception';
import {ModuleLoader} from '../loader';
import {Project} from '../../project';
import {WebpackModuleLoader} from './loader';

export class CliCompiler implements ApplicationCompiler {
  private webpack: webpack.Configuration;

  constructor(application: Project) {
    const project = CliConfig.fromProject(application.basePath.toString());

    const app = matchApplication(project.get('apps') || [], application.identifier);

    this.webpack = new NgCliWebpackConfig(baseOptions(application), app).buildConfig();
  }

  compile(): Promise<ModuleLoader> {
    const compiler = webpack(this.webpack);

    return new Promise<ModuleLoader>((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          reject(new CompilerException(`Compilation failed: ${stats.toString()}`));
        }
        else {
          resolve(new WebpackModuleLoader(this.webpack));
        }
      });
    });
  }
}

const matchApplication = (apps: Array<any>, identifier: string | number | null) => {
  switch (typeof identifier) {
    case 'object':
    case 'undefined':
      switch (apps.length) {
        case 0:
          throw new CompilerException('No applications found in CLI configuration json');
        case 1:
          return apps[0];
        default:
          throw new CompilerException('Your CLI configuration has more than one application, please provide explicit identifier to tell me which one to compile');
      }
    case 'number':
      return apps[identifier] || (() => {
        throw new CompilerException(`Application index ${identifier} does not exist in CLI configuration`);
      })();
    case 'string':
      return apps.find(a => a.name.toLowerCase() === (identifier as string).toLowerCase()) || (() => {
        throw new CompilerException(`Cannot find an application named ${identifier} in the CLI configuration`);
      })();
    default:
      throw new CompilerException(`Invalid application identifier type: ${typeof identifier}`)
  }
};

const baseOptions = (project: Project) => {
  return {
    target: 'node',
    environment: 'development',
    outputPath: project.workingPath ? project.workingPath.toString() : null,
    aot: true,
    sourcemaps: true,
    vendorChunk: false,
    baseHref: '/',
    deployUrl: null,
    verbose: true,
    progress: false,
    i18nFile: null,
    i18nFormat: null,
    locale: null,
    extractCss: false,
    watch: false,
    outputHashing: null,
    poll: null,
    app: project.identifier ? project.identifier.toString() : null
  }
};