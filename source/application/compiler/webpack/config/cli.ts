import {CompilerException} from '../../../../exception';
import {ConfigurationLoader} from './loader';
import {Project} from '../../../project';

const {CliConfig} = require('@angular/cli/models/config');

const {NgCliWebpackConfig} = require('@angular/cli/models/webpack-config');

export class CliLoader implements ConfigurationLoader {
  load(project: Project) {
    const options = CliConfig.fromProject(project.basePath.toString());

    const app = matchApplication(options.get('apps') || [], project.identifier);

    const cli = new NgCliWebpackConfig(baseOptions(project), app);

    return cli.buildConfig();
  }
}

const matchApplication = (apps: Array<any>, identifier?: string | number) => {
  switch (typeof identifier) {
    case 'object':
    case 'undefined':
      if (identifier != null) {
        throw new CompilerException(`Invalid application identifier: ${identifier}`);
      }
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
    target: project.environment,
    environment: project.environment || process.env.NODE_ENV || 'prod',
    outputPath: project.workingPath ? project.workingPath.toString() : null,
    aot: false,
    sourcemaps: true,
    vendorChunk: false,
    verbose: true,
    progress: false,
    extractCss: false,
    watch: false,
    outputHashing: null,
    poll: null,
    app: project.identifier ? project.identifier.toString() : null
  }
};