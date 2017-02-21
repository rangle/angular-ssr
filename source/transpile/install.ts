import {TranspileException} from '../exception';

import {transpile} from './transpile';

import {fileFromString} from '../filesystem';

import {importAngularSources, debundleModuleId} from './debundle';

export type Uninstall = () => void;

type ModuleHandler = (module: NodeModule, filename: string, fallback: () => any) => any;

export const install = (): Uninstall => {
  const installed = [
    installExtension('js', transpileJavaScript)
  ];

  return () => installed.forEach(uninstall => uninstall());
};

const installExtension = (ext: string, handler: ModuleHandler) => {
  const extension = `.${ext}`;

  const previous = require.extensions[extension];

  require.extensions[extension] =
    (module: NodeModule, filename: string) =>
      handler(module, filename, () => previous(module, filename));

  return () => {
    require.extensions[extension] = previous;
  };
};

const transpileJavaScript: ModuleHandler = (module, filename, fallback) => {
  if (/@angular/.test(module.id)) {
    const resolved = require.resolve(debundleModuleId(module.id));
    if (resolved == null) {
      throw new TranspileException(`Cannot resolve module: ${module.id}`);
    }

    const code = fileFromString(resolved).content();

    return transpile(module, importAngularSources(code)).load();
  }

  return fallback();
}

install();
