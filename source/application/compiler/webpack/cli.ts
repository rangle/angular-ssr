import {Configuration} from 'webpack';

import {CompilerException} from '../../../exception';

import {Project} from '../../project';

const {CliConfig} = require('@angular/cli/models/config');

const {NgCliWebpackConfig} = require('@angular/cli/models/webpack-config');

export const cliProjectToWebpackConfiguration = (application: Project): Configuration => {
  const project = CliConfig.fromProject(application.basePath.toString());

  const app = matchApplication(project.get('apps') || [], application.identifier);

  const cli = new NgCliWebpackConfig(baseOptions(application), app);

  return cli.buildConfig();
};

const matchApplication = (apps: Array<any>, identifier?: string | number) => {
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
    environment: process.env.NODE_ENV || 'development',
    outputPath: project.workingPath ? project.workingPath.toString() : null,
    aot: true,
    sourcemaps: true,
    vendorChunk: false,
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