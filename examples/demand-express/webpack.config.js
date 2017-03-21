const {join, resolve} = require('path');

const {AotPlugin} = require('@ngtools/webpack');

const loaders = require('./webpack/loaders');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './app/main.ts',
  output: {
    filename: 'app.js',
    path: resolve(join(__dirname, 'dist')),
    publicPath: '/',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index.html',
      inject: 'body',
    }),
    new AotPlugin({
      tsConfigPath: resolve(join(__dirname, 'tsconfig.json')),
      entryModule: resolve(join(__dirname, 'app', 'app.module')) + '#AppModule'
    })
  ],
  module: {
    rules: [
      loaders.ts,
      loaders.html,
      loaders.css
    ]
  }
};
