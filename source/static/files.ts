export namespace Files {
  // Angular CLI configuration file names
  export const cli = ['angular-cli.json', '.angular-cli.json'];

  // Default filename used when writing route structures to disk (eg foo/index.html)
  export const index = 'index.html';

  // The possible names of node_modules folders (TODO(bond): Really inviolate or configurable?)
  export const modules = 'node_modules';

  // The names we will search when we look for project tsconfig.json files
  export const tsconfig = ['tsconfig.app.json', 'tsconfig.json'];

  // Webpack configuration filenames sorted in precedence order
  export const webpack = ['webpack.server.config.js', 'webpack.app.config.js', 'webpack.config.js'];
}
