import {TranspileResult} from './transpiler';

import {transpileCache} from './cache';

const Module = require('module');

export const runner = <R>(module: NodeModule, source: string): TranspileResult<R> => {
  let executed = false;

  return <TranspileResult<R>> {
    module,
    source,
    run: (): R => {
      if (executed === false) {
        compile(module, source);
      }
      return module.exports;
    }
  };
};

const compile = (module: NodeModule, source: string): void => {
  Module.prototype._compile.call(module, source, module.filename);

  cache(module, source);
};

const cache = (module: NodeModule, source: string) => {
  transpileCache.write(module.id, {module, source, run: () => module.exports});
};
