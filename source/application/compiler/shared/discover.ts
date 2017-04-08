import {Program} from 'typescript';

import {CompilerException} from '../../../exception';

import {ModuleDeclaration} from '../../project';

import {discoverRootModule} from '../../static/root-module';

export const loadApplicationModule = (program: Program, basePath: string, module: ModuleDeclaration): ModuleDeclaration => {
  const invalid = () =>
    !module ||
    !module.source ||
    !module.symbol;

  if (invalid()) {
    module = discoverRootModule(basePath, program);

    if (invalid()) {
      throw new CompilerException(`Cannot discover the source file containing the root application NgModule and the name of the module, please use explicit options`);
    }
  }

  return module;
};
