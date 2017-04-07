import {join} from 'path';

import {ApplicationCompiler} from './compiler';
import {NgcCompiler} from './ngc/compiler';
import {Project} from '../project';
import {fileFromString} from '../../filesystem';
import {cliConfiguration, webpackConfiguration} from '../../static';

export const getCompilerFromProject = (project: Project): ApplicationCompiler => {
  const hasFile = (filename: string): boolean => {
    return fileFromString(join(project.basePath.toString(), filename)).exists();
  }

  if (hasFile(webpackConfiguration)) {
    // return new WebpackCompiler(project) TODO(bond): Enable when implemented
  }
  else if (cliConfiguration.some(f => hasFile(f))) {
    // return new CliCompiler(project) TODO(bond): Enable when implemented
  }

  return new NgcCompiler(project);
};