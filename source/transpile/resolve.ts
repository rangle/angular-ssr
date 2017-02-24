const Module = require('module');

import {dirname, join, normalize, resolve} from 'path';

import {pathFromString} from '../filesystem';
import {debundleImport} from './composed';

export const resolveFrom = (moduleId: string, fromPath: string): string => {
  moduleId = debundleImport(moduleId);

  try {
    return require.resolve(moduleId);
  }
  catch (unused) {}

  const path = normalize(resolve(fromPath));

  const placeholder = join(path, 'none');

  const root = pathFromString(path);
  const definition = root.traverseUpward('package.json');
  const paths = [fromPath, dirname(definition.toString())];

  const options = {
    id: placeholder,
    filename: `${placeholder}.js`,
    paths: paths.reduce((p, c) => p.concat(Module._nodeModulePaths(c)), []),
  };

	try {
		return Module._resolveFilename(moduleId, options);
  }
  catch (exception) {
    return null;
  }
};