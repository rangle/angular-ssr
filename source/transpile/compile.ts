import {CompilerException} from '../exception';

import {Module, ModuleExports} from './module';

export interface ModuleWithExports {
  source: string;
  module: NodeModule;
  exports(): ModuleExports;
}

export const compile = (module: NodeModule, source: string): ModuleWithExports => {
  try {
    Module.compile(module, source);

    return <ModuleWithExports> {
      module,
      source,
      exports: () => module.exports,
    };
  }
  catch (exception) {
    throw new CompilerException(`Failed to compile: ${module.id}: ${exception.stack}`);
  }
};
