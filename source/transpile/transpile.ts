import {ScriptTarget} from 'typescript';

import {Script, createContext} from 'vm';

import {transform} from 'babel-core';

import {TranspileException} from '../exception';

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

export const transpile = <R>(module: NodeModule, source: string, sourceType = ScriptTarget.ES2015): TranspileResult<R> => {
  return cache.read(module.id, () => factory<R>(module, source, sourceType));
};

export const factory = <R>(module: NodeModule, source: string, sourceType: ScriptTarget): TranspileResult<R> => {
  const filename = require.resolve(module.id);

  try {
    const {code} = transform(source, {presets: [sourceToPreset(sourceType)], sourceMaps: false, compact: true, filename});
    if (code == null) {
      throw new TranspileException(`Catastrophic transpilation error: ${module.id}`);
    }

    let executed = undefined;

    return <TranspileResult<R>> {
      load: (): R => {
        if (executed === undefined) {
          const script = new Script(code, {filename, displayErrors: true});

          const exports = module.exports;

          const context = createContext({require: mid => module.require(mid), global, module, exports});

          script.runInContext(context);

          cache.write(module.id, {load: () => exports});

          executed = exports;
        }
        return executed;
      }
    };
  }
  catch (exception) {
    throw new TranspileException(`Transpilation of ${module.id} failed`, exception);
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
