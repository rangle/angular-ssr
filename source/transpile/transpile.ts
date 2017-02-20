import {ScriptTarget} from 'typescript';

import {transform} from 'babel-core';

import {TranspileException} from 'exception';

export type TranspileResult<R> = {
  load(): R;
}

const transpiled = new Map<string, TranspileResult<any>>();

const cache = {
  read<T>(moduleId: string, factory?: () => TranspileResult<T>): TranspileResult<T> {
    let cached = transpiled.get(moduleId);
    if (cached == null) {
      if (factory) {
        cached = factory();
      }
    }
    return cached;
  },
  write<T>(moduleId: string, moduleResult: TranspileResult<T>) {
    transpiled.set(moduleId, moduleResult);
    return moduleResult;
  },
  clear() {
    transpiled.clear();
  }
};

export const transpile = <R>(moduleId: string, source: string, sourceType = ScriptTarget.ES2015): TranspileResult<R> => {
  return cache.read(moduleId, () => factory<R>(moduleId, source, sourceType));
};

export const factory = <R>(moduleId: string, source: string, sourceType: ScriptTarget): TranspileResult<R> => {
  const filename = require.resolve(moduleId);

  try {
    const {code} = transform(source, {presets: [sourceToPreset(sourceType)], sourceMaps: false, filename});
    if (code == null) {
      throw new TranspileException(`Catastrophic transpilation unknownm error: ${moduleId}`);
    }

    let executed = undefined;

    return <TranspileResult<R>> {
      load: (): R => {
        if (executed === undefined) {
          const execute = new Function('exports', code);
          const exports = {};
          execute(exports);

          cache.write(moduleId, {load: () => exports});

          executed = exports;
        }
        return executed;
      }
    };
  }
  catch (exception) {
    throw new TranspileException(`Transpilation of ${moduleId} failed`, exception);
  }
};

const sourceToPreset = (sourceType: ScriptTarget): string => {
  switch (sourceType) {
    case ScriptTarget.ES2015:
      return 'es2015';
    default:
      throw new TranspileException(`${ScriptTarget[sourceType]} not supported by installed Babel plugins`);
  }
};
