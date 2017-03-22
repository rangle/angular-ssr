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
  node: {
    global: true,
    process: true,
    __dirname: true,
    __filename: true,
    Buffer: true
  },
};
