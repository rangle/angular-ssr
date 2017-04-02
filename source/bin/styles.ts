import {basename, dirname, join, sep} from 'path';

import sass = require('node-sass');

import importer from 'sass-module-importer';

import {TranspileException} from '../exception';

import {fileFromString} from '../filesystem/factories';

const partialImport = (path: string, prev: string): {file: string} => {
  let candidates = [
    path,
    prev.replace(/\//g, sep),
    join(dirname(path), `_${basename(path)}`)
  ];

  candidates = candidates.reduce((p, c) => [...p, c, `${c}.scss`, `${c}.sass`], []);

  for (const c of candidates) {
    if (fileFromString(c).exists()) {
      return {file: c};
    }
  }

  return null;
};

for (const extension of ['scss', 'sass']) {
  require.extensions[extension] = (source: string, filename: string) => {
    try {
      const rendered = sass.renderSync({
        file: filename,
        importer: [partialImport, importer(), partialImport]
      });

      return rendered.css.toString();
    }
    catch (exception) {
      throw new TranspileException(`Failed to render ${filename}: ${exception.message}`, exception);
    }
  };
}

require('node-stylus-require').register({extensions: '.styl'});