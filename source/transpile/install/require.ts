import {transpilers} from '../composed';
import {transpileCache} from '../cache';
import {processTranspile} from '../process';

export type Uninstall = () => void;

export const install = (): Uninstall => {
  const installed = new Array<Uninstall>();

  const extensions = new Set<string>(transpilers.map(t => t.extension));

  for (const extension of Array.from(extensions)) {
    installed.push(installExtension(extension));
  }

  return () => {
    installed.forEach(uninstall => uninstall());

    transpileCache.clear();
  };
};

export const installExtension = (extension: string): Uninstall => {
  const previous = require.extensions[extension];

  require.extensions[extension] =
    (module: NodeModule, filename: string) => {
      const fallback = () => previous(module, filename);

      const transpiled = processTranspile(module, filename);
      if (transpiled == null) {
        return fallback();
      }

      return transpiled.run();
    };

  return () => {
    require.extensions[extension] = previous;
  };
};
