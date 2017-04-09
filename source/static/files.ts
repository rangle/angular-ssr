export abstract class Files {
  // Angular CLI configuration file names
  static readonly cli = ['angular-cli.json', '.angular-cli.json'];

  // Filename used when writing route structures to disk (eg foo/index.html)
  static readonly index = 'index.html';

  // The possible names of node_modules folders (TODO(bond): Really inviolate or configurable?)
  static readonly modules = 'node_modules';

  // The names we will search when we look for project tsconfig.json files
  static readonly tsconfig = ['tsconfig.app.json', 'tsconfig.json'];

  // Webpack configuration filenames sorted in precedence order
  static readonly webpack = ['webpack.server.config.js', 'webpack.app.config.js', 'webpack.config.js'];
}
