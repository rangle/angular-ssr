import {extname} from 'path';

import {TranspileException} from '../exception';
import {TranspileResult} from './transpiler';
import {fileFromString} from '../filesystem';
import {transpilers} from './composed';
import {runner} from './runner';

export const processTranspile = <R>(module: NodeModule, filename: string): TranspileResult<R> => {
  for (const transpiler of transpilers) {
    if (transpiler.extension !== extname(filename)) {
      continue;
    }
    if (transpiler.expression) {
      if (transpiler.expression.test(filename) === false) {
        continue;
      }
    }

    const moduleId =
      transpiler.moduleTranslator
        ? transpiler.moduleTranslator(module.id)
        : module.id;

    module.id = moduleId;

    const resolved = require.resolve(moduleId);
    if (resolved == null) {
      throw new TranspileException(`Cannot resolve module: ${module.id}`);
    }

    module.filename = resolved;

    const file = fileFromString(filename);

    const content = file.content();

    const preprocessed =
      transpiler.preprocessor
        ? transpiler.preprocessor(content)
        : content;

    const transpiled: TranspileResult<R> =
      transpiler.transpiler
        ? transpiler.transpiler<R>(module, preprocessed)
        : runner<R>(module, preprocessed);

    return transpiled;
  }

  return null;
};

export const process = (source: string, path: string): string => {
  const module: NodeModule = {
    exports: {},
    require,
    id: path.replace(/\.js$/, String()),
    filename: path,
    loaded: false,
    parent: null,
    children: [],
  }

  const result = processTranspile(module, path);
  if (result == null) {
    return source;
  }
  return result.source;
}