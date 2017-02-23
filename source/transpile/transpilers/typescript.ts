// NOTE(cbond): The TypeScript transpiler is only used by our unit testing framework,
// jest. So we can just import our own tsconfig since this transpiler will never be
// used on application code. It is only for our unit tests.

import {
  TranspileOptions,
  formatDiagnostics,
  transpileModule
} from 'typescript';

import {EOL} from 'os';

import {relative} from 'path';

import {TranspileException} from '../../exception';
import {TranspileResult} from '../transpile';
import {transpileCache} from '../cache';
import {evaluateModule} from '../evaluate';

const tsconfig = require('../../../tsconfig.json');

export const compilets = <R>(module: NodeModule, source: string): TranspileResult<R> =>
  transpileCache.read(module.filename, () => factory<R>(module, source, tsconfig));

const factory = <R>(module: NodeModule, source: string, tsconfig): TranspileResult<R> => {
  const path = relative(process.cwd(), module.filename);

  const transpileOptions: TranspileOptions = {
    compilerOptions: tsconfig.compilerOptions,
    fileName: path,
    reportDiagnostics: true,
    moduleName: module.id,
  }

  const result = transpileModule(source, transpileOptions);

  if (result.diagnostics.length > 0) {
    const host = {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => EOL,
    };

    throw new TranspileException(`TypeScript transpilation failed: ${formatDiagnostics(result.diagnostics, host)}`);
  }

  return evaluateModule<R>(module, result.outputText);
};