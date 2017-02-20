import {TranspileException} from 'exception';

import {transpile} from 'transpile';

import {fileFromString} from 'filesystem';

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

// We want to avoid using the Angular UMD bundles, because when we generate NgFactory
// files in memory they do deep imports into various @angular libraries, which causes
// the application code and the rendered-application code will cause two copies of all
// @angular libraries to be loaded into memory (umd bundles and direct source).
// This is because Angular generates NgFactory files with import statements that access
// internal APIs, a questionable design decision. So by doing this transformation in
// two places: this file (for regular applications) and transpile.js (for unit tests)
// we ensure that we are always bypassing the bundle UMD files in both our library code
// and the and rendered application. Otherwise, providers and opaque tokens will compare
// as unequal during the rendering process.
export const importAngularSources = (source: string): string => {
  return source
    .replace(/from ['"]@angular\/([^\/'"]+)['"]/g, 'from "@angular/$1/index"')
    .replace(/require\(['"]@angular\/([^\/'"]+)['"]\)/g, 'require("@angular/$1/index")');
};

export const debundleAngularModuleId =
  (moduleId: string): string => moduleId.replace(/@angular\/([^\/]+)$/, '@angular/$1/index');

const transpileJavaScript = (moduleId: string, fallback: () => any) => {
  const resolved = require.resolve(debundleAngularModuleId(moduleId));
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
