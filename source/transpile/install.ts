import {dirname} from 'path';

import {transpilers} from './composed';
import {transpileMatch} from './process';
import {compile} from './compile';
import {Cache} from '../cache';

export type Uninstall = () => void;

export const install = (): Uninstall => {
  const installed = new Array<Uninstall>();

  const extensions = new Set<string>(transpilers(false).map(t => t.extension));

  for (const extension of Array.from(extensions)) {
    installed.push(installExtension(extension));
  }

  return () => installed.forEach(uninstall => uninstall());
};

const cache = new Cache<string, any>();

export const installExtension = (extension: string): Uninstall => {
  const previous = require.extensions[extension];

  require.extensions[extension] =
    (module: NodeModule, filename: string) => {
      const fallback = () => previous(module, filename);

      return cache.query(module.id, () => {
        const transpiled = transpileMatch(false, module, filename, dirname(filename));
        if (transpiled == null) {
          return fallback();
        }

        const compiled = compile(module, transpiled);

        return compiled.exports();
      });
    };

  return () => {
    require.extensions[extension] = previous;
  };
};
