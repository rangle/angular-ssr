import {Configuration} from 'webpack';

import {CompilerException} from '../../../exception';
import {Project} from '../../project';
import {pathFromString} from '../../../filesystem';
import {webpackConfiguration} from '../../../static/files';

export const projectToWebpackConfiguration = (project: Project): Configuration => {
  const basePath = pathFromString(project.basePath);

  if (project.webpack == null) {
    const matches = basePath.files(f => webpackConfiguration.find(c => c.toLowerCase() === f.name().toLowerCase()) != null);

    switch (matches.size) {
      case 0:
        throw new CompilerException(`Cannot find a webpack configuration in ${project.basePath}, use explicit name command-line arguments`);
      case 1:
        project.webpack = Array.from(matches.values())[0];
        break;
      default:
        throw new CompilerException(`Multiple possible webpack configurations found, choose one explicitly: ${Array.from(matches).map(m => m.name()).join(', ')}`);
    }
  }

  if (project.webpack.exists() === false) {
    throw new CompilerException(`Webpack configuration file does not exist: ${project.webpack.toString()}`);
  }

  return require(project.webpack.toString());
};