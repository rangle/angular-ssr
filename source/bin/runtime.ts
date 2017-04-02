import {join} from 'path';

const {plugins} = require('babel-preset-es2015');

import {modules} from '../static';

// Some history is required for this piece of code. Prior to Angular 4, the core team shipped
// multiple versions of each library, two of which we used: the umd bundle and the JavaScript
// compilation output (target es2015), in the src directories. This was problematic because we
// were always forced to use the files from src and never the umd bundles, because NgFactory
// files always contained imports into deep Angular source. Without forcing the use of src always,
// we would get multiple definitions of the same DI tokens, which would result invariably in
// a failure to bootstrap the application. So we forced the app to always import from src and
// never use umd bundles. The story was the same for @angular/material.
//
// But now with Angular 4, everything is shipped in bundles, the src folder is empty, and the
// generated NgFactory files import from those same bundles. So we no longer need to jump through
// hoops just to include Angular code: we can always load from the bundles, which are always
// referenced in the package.json main entry. Generated NgFactory files will do the same.
//
// Unfortunately, it appears that many other projects have not yet caught up to this way
// of doing things. So we must transpile those sources from es2015 to something that can run
// on modern nodejs. We also have our own custom import -> CommonJS plugin because the default
// one that comes in the es2015 preset does not allow you to export the same symbol from the
// same file twice (which @angular/material currently does in several barrel index.ts files).
//
// Libraries that are known to ship in NodeJS compatible formats are whitelisted. And it is
// worth pointing out that this transpilation stuff is for ng-render only (for applications
// using the API, they get to use their own webpack / transpilation process).

export const registerTranspiler = (skip: Array<string>) => {
  require('babel-register')({
    ast: false,
    compact: false,
    minified: false,
    ignore: (filename: string) => {
      if (/@angular(\\|\/)material/.test(filename)) { // material requires transpilation, other @angular packages do not
        return false;
      }
      if (whitelist.test(filename) || /babel/.test(filename)) {
        return true;
      }
      if (skip.some(s => filename.indexOf(join(modules, s)) >= 0)) {
        return true;
      }
      return false;
    },
    plugins: [
      require.resolve('es2015-imports-to-commonjs-loose'),
      ...plugins
    ],
  });
};

// This is just a performance optimization: we know that these libraries ship in a NodeJS compatible format, therefore
// there is no need to transpile them through Babel. Everything outside of this list will be transpiled using the es2015
// Babel preset, mainly because people use all kinds of libraries in their projects and we have no way of knowing whether
// they need transpilation, so we just assume they all do.
const whitelist = /\/(\@angular|angular-ssr|scoped-logger|tsickle|domino|rxjs|zone\.js|mkpath|preboot|regenerator-transform|es2015-imports-to-commonjs-loose|mock-local-storage|lru_map|typescript|reflect-metadata|core-js|bundles)\//;
