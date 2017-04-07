import {ApplicationCompiler} from '../compiler';
import {CompilerException} from '../../../exception';
import {ModuleLoader} from '../loader';
import {Project} from '../../project';

export class WebpackCompiler implements ApplicationCompiler {
  constructor(project: Project) {}

  async compile(): Promise<ModuleLoader> {
    throw new CompilerException('Not implemented');
  }
}