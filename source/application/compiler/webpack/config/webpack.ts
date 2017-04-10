import {CompilerException} from '../../../../exception';
import {ConfigurationLoader} from './loader';
import {Files} from '../../../../static';
import {Project} from '../../../project';
import {pathFromString} from '../../../../filesystem';

export class WebpackLoader implements ConfigurationLoader {
  load(project: Project) {
    const basePath = pathFromString(project.basePath);

    if (project.webpack == null) {
      const matches = basePath.files(f => Files.webpack.find(c => c === f.name()) != null);

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
  }
}