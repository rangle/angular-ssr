import {readFileSync} from 'fs';

import {CompilerException} from 'exception';

installExtensions();

const {transform} = require('babel-core');

export const transpile = (moduleId: string): [string, string] => {
  const path = require.resolve(moduleId);
  if (path == null) {
    throw new CompilerException(`Cannot resolve module path: ${moduleId}`);
  }

  const content = readFileSync(path).toString();

  try {
    const {code} = transform(content, {presets: ['es2015'], sourceMaps: false});
    return [path, code];
  }
  catch (exception) {
    throw new CompilerException(`Transpilation of ${moduleId} failed: ${exception.message}`, exception);
  }
};

function installExtensions() {
  if (require.extensions['.json']) { // babel requires its own package.json
    return;
  }
  require.extensions['.json'] = (module: string, filename: string) => {
    return JSON.parse(readFileSync(filename).toString());
  };
}