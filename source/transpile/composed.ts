import {compilejs, compilets} from './transpilers';

import {TranspilationHandler, composePreprocesors} from './transpile';

const importSources = (source: string) =>
  composePreprocesors(transformRequires, transformImports)(source);

export const transpilers = new Array<TranspilationHandler>(
  {
    extension: '.js',
    expression: /@angular/,
    preprocessor: importSources,
    transpiler: compilejs,
    moduleTranslator: debundleImport,
  },
  {
    extension: '.js',
    expression: /^(?!.*\/node_modules(?=\/))/,
    preprocessor: importSources,
    transpiler: null,
    moduleTranslator: debundleImport,
  },
  {
    extension: '.ts',
    expression: /\.ts$/,
    preprocessor: importSources,
    transpiler: compilets,
  });

// FIXME(cbond): This is going to be replaced with a real refactorer that uses the
// TypeSript compiler to do static analysis of the application source and transform
// that code

// We want to avoid using the Angular UMD bundles, because when we generate NgFactory
// files in memory they do deep imports into various @angular libraries, which causes
// the application code and the rendered-application code will cause two copies of all
// @angular libraries to be loaded into memory (umd bundles and direct source).
// This is because Angular generates NgFactory files with import statements that access
// internal APIs, a questionable design decision. So by doing this transformation in
// two places: this file (for regular applications) and transpile.js (for unit tests)
// we ensure that we are always bypassing the bundle UMD files in both our library code
// and the and rendered application. Otherwise, providers and opaque tokens will compare
// as unequal during the rendering process.
export function transformRequires(source: string): string {
  return source.replace(/require\(['"]@angular\/([^\/'"]+)['"]\)/g, 'require("@angular/$1/index")');
}

export function transformImports(source: string): string {
  return source.replace(/from ['"]@angular\/([^\/'"]+)['"]/g, 'from "@angular/$1/index"');
}

export function debundleImport(moduleId: string) {
  return moduleId.replace(/@angular\/([^\/]+)$/, '@angular/$1/index');
}
