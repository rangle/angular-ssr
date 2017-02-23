import {TranspileResult} from './transpile';

const transpiled = new Map<string, TranspileResult<any>>();

export const transpileCache = {
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
