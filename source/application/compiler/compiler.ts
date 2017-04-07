import {ModuleLoader} from './loader';

export interface ApplicationCompiler {
  compile(): Promise<ModuleLoader>;
}