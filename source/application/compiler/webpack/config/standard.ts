import {CompilerException} from '../../../../exception';
import {ConfigurationLoader} from './loader';
import {Files} from '../../../../static';
import {Project} from '../../../project';
import {pathFromString} from '../../../../filesystem';

export class StandardLoader implements ConfigurationLoader {
  constructor(private project: Project) {}

  load() {
    const basePath = pathFromString(this.project.basePath);

    if (this.project.webpack == null) {
      const matches = basePath.files(f => Files.webpack.find(c => c.toLowerCase() === f.name().toLowerCase()) != null);

      switch (matches.size) {
        case 0:
          throw new CompilerException(`Cannot find a webpack configuration in ${this.project.basePath}, use explicit name command-line arguments`);
        case 1:
          this.project.webpack = Array.from(matches.values())[0];
          break;
        default:
          throw new CompilerException(`Multiple possible webpack configurations found, choose one explicitly: ${Array.from(matches).map(m => m.name()).join(', ')}`);
      }
    }

    if (this.project.webpack.exists() === false) {
      throw new CompilerException(`Webpack configuration file does not exist: ${this.project.webpack.toString()}`);
    }

    return require(this.project.webpack.toString());
  }
}