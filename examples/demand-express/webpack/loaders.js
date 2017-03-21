exports.ts = {
  test: /\.ts$/,
  use: '@ngtools/webpack',
};

exports.tsjit = {
  test: /\.ts$/,
  use: [
    'awesome-typescript-loader',
    'angular2-template-loader',
    'angular-router-loader',
  ],
};

exports.html = {
  test: /\.html$/,
  use: 'raw-loader',
};

exports.css = {
  test: /\.css$/,
  exclude: /node_modules/,
  use: [
    'to-string-loader',
    'css-loader',
  ],
};
