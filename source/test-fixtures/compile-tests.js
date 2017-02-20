const {readFileSync} = require('fs');
const {normalize, join} = require('path');
const {EOL} = require('os');

const {formatDiagnostics, transpile} = require('typescript');

const babel = require('babel-core').transform;

const tsconfig = require('../../tsconfig.json');

module.exports = {
  process: function(src, path) {
    if (/\.ts$/.test(path)) {
      return compileTypeScript(src, path);
    }
    else if (/@angular\//.test(path)) {
      return compileAngularSource(src, path);
    }
    else {
      return src;
    }
  },
};

function compileTypeScript(src, path) {
  const diagnostics = [];

  const options = Object.assign({}, tsconfig.compilerOptions);

  const transformed = importAngularSources(src);

  const result = transpile(transformed, options, path, diagnostics);

  if (diagnostics.length > 0) {
    const host = {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => EOL,
    };

    throw new Error(`TypeScript transpilation failed: ${formatDiagnostics(diagnostics, host)}`);
  }

  return result;
}

function debundle(path) {
  return path.replace(/@angular\/([a-z]+)\/bundles\/([a-z]+).umd.js$/, '@angular/$1/index.js');
}

function compileAngularSource(src, path) {
  src = importAngularSources(readFileSync(debundle(path)).toString());
  const {code} = babel(src, {presets: ['es2015']});
  return code;
}

function importAngularSources(source) {
  // We want to avoid using the Angular UMD bundles, because when we generate NgFactory
  // files in memory they do deep imports into various @angular libraries, which causes
  // the application code and the rendered-application code will cause two copies of all
  // @angular libraries to be loaded into memory (umd bundles and direct source).
  // This is because Angular generates NgFactory files with import statements that access
  // internal APIs, a questionable design decision. So by doing this transformation in
  // two places: this file (for tests) and transpile/install.ts (for regular application
  // execution) we ensure that we are always bypassing the bundle UMD files in both
  // our library code and the and rendered application. Otherwise, providers and opaque
  // tokens will compare as unequal during the rendering process.
  return source
    .replace(/from ['"]@angular\/([^\/'"]+)['"]/g, 'from "@angular/$1/index"')
    .replace(/require\(['"]@angular\/([^\/'"]+)['"]\)/g, 'require("@angular/$1/index")');
}