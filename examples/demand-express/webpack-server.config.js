const {join, resolve} = require('path');

const loaders = require('./webpack/loaders');

module.exports = {
  target: 'node',
  entry: {
    server: ['./server/index.ts'],
  },
  output: {
    filename: 'index.js',
    path: resolve(join(__dirname, 'dist-server')),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      loaders.tsjit,
      loaders.html,
      loaders.css
    ]
  },
  plugins: [],
  externals: [
    '@angular/cli',
    '@angular/common',
    '@angular/compiler',
    '@angular/compiler-cli',
    '@angular/core',
    '@angular/forms',
    '@angular/http',
    '@angular/platform-browser',
    '@angular/router',
    '@angular/tsc-wrapped',
    '@angular/service-worker',
    'angular-ssr',
    'express',
    function(context, request, callback) {
      const exclusions = [/\@ngrx/, /rxjs/, /zone\.js/, /reflect-metadata/];

      if (exclusions.some(expr => expr.test(request))) {
        callback(null, `commonjs ${request.replace(/^.*?(\\|\/)node_modules(\\|\/)/, String())}`);
      }
      else {
        callback();
      }
    },
  ],
  node: {
    process: true,
    __dirname: true,
    __filename: true
  }
};
