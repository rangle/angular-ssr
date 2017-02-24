import {cwd} from 'process';

import {extname} from 'path';

import {TranspileException} from '../exception';
import {TranspileResult} from './transpile';
import {fileFromString} from '../filesystem';
import {evaluateModule} from './evaluate';
import {transpilers} from './composed';
import {resolveFrom} from './resolve';

export const transpileMatch = <R>(module: NodeModule, filename: string, basePath?: string): TranspileResult<R> => {
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

    const resolved = resolveFrom(moduleId, basePath || cwd());
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
        : evaluateModule<R>(module, preprocessed);

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

  const result = transpileMatch(module, path);
  if (result == null) {
    return source;
  }
  return result.source;
}