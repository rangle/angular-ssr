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
// Unfortunately, it appears the @angular/material project has not yet caught up to this way
// of doing things. And once again our NgFactory files point to imports deep inside
// @angular/material, so we must transpile those sources from es2015 to something that can run
// on modern nodejs. In practice this just means translating import and export statements to
// CommonJS style require / exports.
//
// Once the @angular/material team updates their distribution to use the same style of packaging
// as the core packages (eg. @angular/core, etc.), then we can get rid of this transpilation
// step. As it is, the only library that transpilation is applied to is @angular/material. And
// this code is temporary -- it will die when @angular/material ships in the same way as the
// rest of the @angular dependencies.
require('babel-register')({
  ast: false,
  compact: false,
  minified: false,
  only: /\@angular(\\|\/)material/,
  plugins: [require.resolve('es2015-imports-to-commonjs-loose')],
});

require('require-sass')();

require('node-stylus-require').register({extensions: '.styl'});
