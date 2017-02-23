import {TranspileResult} from './transpile';

import {transpileCache} from './cache';

const Module = require('module');

export const evaluateModule = <R>(module: NodeModule, source: string): TranspileResult<R> => {
  let executed = false;

  const run = (): R => {
    if (executed === false) {
      compile(module, source);
    }
    return module.exports;
  };

  return <TranspileResult<R>> {module, source, run};
};

const compile = (module: NodeModule, source: string): void => {
  Module.prototype._compile.call(module, source, module.filename);

  cache(module, source);
};

const cache = (module: NodeModule, source: string) => {
  transpileCache.write(module.id, {module, source, run: () => module.exports});
};
