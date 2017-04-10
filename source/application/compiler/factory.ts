import {ApplicationCompiler} from './compiler';
import {CliLoader, WebpackLoader} from './webpack/config';
import {Files} from '../../static';
import {NgcCompiler} from './ngc/compiler';
import {Project} from '../project';
import {WebpackCompiler} from './webpack/compiler';

export const getCompilerFromProject = (project: Project): ApplicationCompiler => {
  const hasFile = (filename: string): boolean => project.basePath.findInAncestor(filename) != null;

  if (Files.webpack.some(f => hasFile(f))) {
    return new WebpackCompiler(project, new WebpackLoader());
  }
  else if (Files.cli.some(f => hasFile(f))) {
    return new WebpackCompiler(project, new CliLoader());
  }
  else {
    return new NgcCompiler(project);
  }
};