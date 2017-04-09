import {join} from 'path';

import {ApplicationCompiler} from './compiler';
import {CliLoader, StandardLoader} from './webpack/config';
import {Files} from '../../static';
import {NgcCompiler} from './ngc/compiler';
import {Project} from '../project';
import {WebpackCompiler} from './webpack/compiler';
import {fileFromString} from '../../filesystem';

export const getCompilerFromProject = (project: Project): ApplicationCompiler => {
  const hasFile = (filename: string): boolean =>
    fileFromString(join(project.basePath.toString(), filename)).exists();

  if (Files.webpack.some(f => hasFile(f))) {
    return new WebpackCompiler(project, new StandardLoader(project));
  }
  else if (Files.cli.some(f => hasFile(f))) {
    return new WebpackCompiler(project, new CliLoader(project));
  }
  else {
    return new NgcCompiler(project);
  }
};