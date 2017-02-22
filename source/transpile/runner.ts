import {TranspileResult} from './transpiler';

import {transpileCache} from './cache';

export const runner = <R>(module: NodeModule, source: string): TranspileResult<R> => {
  let exports = undefined;

  const run = (): R => {
    if (exports === undefined) {
      exports = module.exports;

      (<{_compile?}>module)._compile(source, module.filename);

      transpileCache.write(module.id, {module, source, run: () => exports});
    }

    return exports;
  };

  return <TranspileResult<R>> {module, source, run};
};