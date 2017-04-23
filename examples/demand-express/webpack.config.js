const {join, resolve} = require('path');

const loaders = require('./webpack/loaders');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    client: ['./app/main.ts']
  },
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
  ],
  module: {
    rules: [
      loaders.tsjit,
      loaders.html,
      loaders.css
    ]
  }
};
