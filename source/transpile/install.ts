import {dirname} from 'path';

import {getTranspilers, transpile} from '../transpile';

export type UninstallExtension = () => void;

const transpilers = getTranspilers();

export const install = (): UninstallExtension => {
  if (require.extensions == null) {
    return () => {};
  }

  const installed = new Array<UninstallExtension>();

  const extensions = new Set<string>(transpilers.map(t => t.extension));

  for (const extension of Array.from(extensions)) {
    installed.push(installExtension(extension));
  }

  return () => installed.forEach(uninstall => uninstall());
};

export const installExtension = (extension: string): UninstallExtension => {
  const previous = require.extensions[extension];

  require.extensions[extension] =
    (module: NodeModule & {_compile?}, filename: string) => {
      const fallback = () => previous(module, filename);

      const transpiled = transpile(transpilers, module, dirname(filename));
      if (transpiled == null) {
        return fallback();
      }

      module._compile(transpiled, filename);
    };

  return () => require.extensions[extension] = previous;
};
