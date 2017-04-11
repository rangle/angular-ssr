const {join, resolve} = require('path');

const {CheckerPlugin} = require('awesome-typescript-loader');

const loaders = require('./webpack/loaders');

module.exports = {
  target: 'node',
  entry: './server/index.ts',
  output: {
    filename: 'index.js',
    path: resolve(join(__dirname, 'dist-server')),
    libraryTarget: 'commonjs2',
  },
  devtool: 'source-map',
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
  plugins: [
    new CheckerPlugin(),
  ],
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
    'zone.js',
    'rxjs',
    function(context, request, callback) {
      if (/rxjs/i.test(request) || /observable/i.test(request)) {
        callback(null, `commonjs ${request.replace(/^.*?(\\|\/)node_modules(\\|\/)/, String())}`);
      }
      else {
        callback();
      }
    },
  ],
  node: {
    __dirname: true,
    __filename: true
  }
};
