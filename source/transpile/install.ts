import {TranspileException} from '../exception';

import {transpile} from './transpile';

import {fileFromString} from '../filesystem';

import {importAngularSources, debundleModuleId} from './debundle';

export type Uninstall = () => void;

export const install = (): Uninstall => {
  const installed = [
    installExtension('js',
      (moduleId, fallback) => transpileJavaScript(moduleId, fallback))
  ];

  return () => installed.forEach(uninstall => uninstall());
};

const installExtension = (ext: string, handler: (moduleId: string, fallback: () => any) => any) => {
  const extension = `.${ext}`;

  const previous = require.extensions[extension];

  require.extensions[extension] =
    (moduleId: string) => {
      return handler(moduleId, () => previous(moduleId));
    };

  return () => {
    require.extensions[extension] = previous;
  };
};

const transpileJavaScript = (moduleId: string, fallback: () => any) => {
  const resolved = require.resolve(debundleModuleId(moduleId));
  if (resolved == null) {
    throw new TranspileException(`Cannot resolve module: ${moduleId}`);
  }

  const code = fileFromString(resolved).content();

  if (/^@angular/.test(moduleId)) {
    const transformedCode = importAngularSources(code);

    return transpile(moduleId, transformedCode).load();
  }

  return fallback();
}

install();
