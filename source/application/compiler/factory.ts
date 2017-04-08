import {join} from 'path';

import {ApplicationCompiler} from './compiler';
import {NgcCompiler} from './ngc/compiler';
import {Project} from '../project';
import {WebpackCompiler} from './webpack/compiler';
import {fileFromString} from '../../filesystem';
import {cliConfiguration, webpackConfiguration} from '../../static';
import {cliProjectToWebpackConfiguration } from './webpack/cli';
import {projectToWebpackConfiguration } from './webpack/configuration';

export const getCompilerFromProject = (project: Project): ApplicationCompiler => {
  const hasFile = (filename: string): boolean =>
    fileFromString(join(project.basePath.toString(), filename)).exists();

  if (webpackConfiguration.some(f => hasFile(f))) {
    return new WebpackCompiler(project, projectToWebpackConfiguration(project));
  }
  else if (cliConfiguration.some(f => hasFile(f))) {
    return new WebpackCompiler(project, cliProjectToWebpackConfiguration(project));
  }
  else {
    return new NgcCompiler(project);
  }
};