import {extname} from 'path';

import {fileFromString} from '../filesystem';

import {compilejs} from './languages';

export type Transpiler = (module: NodeModule, source: string) => string;

export type Preprocessor = (source: string) => string;

export interface TranspileDescriptor {
  extension: string;
  expression: RegExp;
  preprocessor: Preprocessor;
  transpiler: Transpiler;
  moduleTranslator?: (moduleId: string) => string;
}

const composePreprocesors = (...preprocessors: Array<Preprocessor>): Preprocessor =>
  (source: string): string => {
    for (const preprocessor of preprocessors) {
      source = preprocessor(source);
    }
    return source;
  };

const importSources = (source: string) => composePreprocesors(transformRequires, transformImports)(source);

export const getTranspilers = (): Array<TranspileDescriptor> =>
  new Array<TranspileDescriptor>({
    extension: '.js',
    expression: /(\\|\/)node_modules(\\|\/)\@angular(\\|\/)/,
    preprocessor: importSources,
    transpiler: compilejs,
    moduleTranslator: debundleImport,
  },
  {
    extension: '.js',
    expression: /^(?!.*\/node_modules(?=\/))/,
    preprocessor: importSources,
    transpiler: null,
  });

export const getTestingTranspilers = (): Array<TranspileDescriptor> =>
  new Array<TranspileDescriptor>({
    extension: '.js',
    expression: /(\\|\/)node_modules(\\|\/)\@angular(\\|\/)/,
    preprocessor: importSources,
    transpiler: compilejs,
    moduleTranslator: debundleImport,
  });

// We want to avoid using the Angular UMD bundles, because when we generate NgFactory files in memory they do
// deep imports into various @angular libraries, which causes the application code and the rendered-application
// code will cause two copies of all @angular libraries to be loaded into memory (umd bundles and direct source).
// This is because Angular generates NgFactory files with import statements that access internal APIs, a
// questionable design decision. So by doing this transformation in two places: this file (for regular applications)
// and transpile.js (for unit tests) we ensure that we are always bypassing the bundle UMD files in both our library
// code and the and rendered application. Otherwise, providers and opaque tokens will compare as unequal.

export const transformRequires = (source: string): string =>
  source.replace(/require\(['"]@angular\/([^\/'"]+)['"]\)/g, 'require("@angular/$1/index")');

export const transformImports = (source: string): string =>
  source.replace(/from ['"]@angular\/([^\/'"]+)['"]/g, 'from "@angular/$1/index"');

export const debundleImport = (moduleId: string): string => {
  if (moduleId.endsWith('.js')) {
    return moduleId.replace(/@angular\/([^\/]+)\/bundles\/([^\/]+).umd.js/, '@angular/$1/index.js');
  }
  return moduleId.replace(/@angular\/([^\/]+)$/, '@angular/$1/index');
};

export const transpile = (transpilers: Array<TranspileDescriptor>, module: NodeModule, basePath?: string): string => {
  for (const transpiler of transpilers) {
    if (transpiler.extension !== extname(module.filename)) {
      continue;
    }

    if (transpiler.expression) {
      if (transpiler.expression.test(module.filename) === false) {
        continue;
      }
    }

    if (transpiler.moduleTranslator) {
      module.filename = require.resolve(transpiler.moduleTranslator(module.id || module.filename));
    }

    const file = fileFromString(module.filename);

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