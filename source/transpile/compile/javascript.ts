import {ScriptTarget} from 'typescript';

import {transform} from 'babel-core';

import {TranspileException} from '../../exception';
import {transpileCache} from '../cache';
import {TranspileResult} from '../transpiler';
import {runner} from '../runner';

export const compilejs = <R>(module: NodeModule, source: string): TranspileResult<R> => {
  return transpileCache.read(module.filename, () => factory<R>(module, source));
};

const factory = <R>(module: NodeModule, source: string): TranspileResult<R> => {
  const filename = module.filename;

  const sourceType = ScriptTarget.ES2015;

  try {
    const {code} = transform(source, {presets: [sourceToPreset(sourceType)], sourceMaps: 'inline', compact: true, filename});
    if (code == null) {
      throw new TranspileException(`Catastrophic transpilation error: ${module.id}`);
    }

    return runner<R>(module, code);
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
