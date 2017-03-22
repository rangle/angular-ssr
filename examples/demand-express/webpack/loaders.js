exports.tsjit = {
  test: /\.ts$/,
  use: ['awesome-typescript-loader', 'angular2-template-loader', 'angular-router-loader'],
};

exports.html = {
  test: /\.html$/,
  use: 'raw-loader',
};

exports.css = {
  test: /\.css$/,
  use: ['to-string-loader', 'css-loader'],
};
