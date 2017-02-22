import {
  Diagnostic,
  formatDiagnostics,
  transpile
} from 'typescript';

import {EOL} from 'os';

import {relative} from 'path';

import {TranspileException} from '../../exception';
import {TranspileResult} from '../transpiler';
import {transpileCache} from '../cache';
import {runner} from '../runner';

const tsconfig = require('../../../tsconfig.json');

export const compilets = <R>(module: NodeModule, source: string): TranspileResult<R> => {
  return transpileCache.read(module.filename, () => factory<R>(module, source, tsconfig));
};

const factory = <R>(module: NodeModule, source: string, tsconfig): TranspileResult<R> => {
  const diagnostics = new Array<Diagnostic>();

  const options = Object.assign({}, tsconfig.compilerOptions);

  const path = relative(process.cwd(), module.filename);

  const result = transpile(source, options, path, diagnostics);

  if (diagnostics.length > 0) {
    const host = {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => EOL,
    };

    throw new TranspileException(`TypeScript transpilation failed: ${formatDiagnostics(diagnostics, host)}`);
  }

  return runner<R>(module, result);
};