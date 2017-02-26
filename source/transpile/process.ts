import {cwd} from 'process';

import {extname} from 'path';

import {Cache} from '../cache';
import {Module} from './module';
import {TranspileException} from '../exception';
import {fileFromString} from '../filesystem';
import {transpilers} from './composed';

export const transpileMatch = (testing: boolean, module: NodeModule, filename: string, basePath?: string): string => {
  for (const transpiler of transpilers(testing)) {
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

    const resolved = Module.relativeResolve(basePath || cwd(), moduleId);
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

    const transpiled: string =
      transpiler.transpiler
        ? transpiler.transpiler(module, preprocessed)
        : preprocessed;

    return transpiled;
  }

  return null;
};

const transpilationCache = new Cache<string, string>();

export const process = (source: string, path: string): string => {
  return transpilationCache.query(path,
    () => {
      const moduleId = path.replace(/\.js$/, String());

      const module = Module.nodeModule(require, moduleId, {});

      return transpileMatch(true, module, path);
    });
}
