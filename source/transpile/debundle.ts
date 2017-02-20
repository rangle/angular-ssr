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

export const debundleModuleId =
  (moduleId: string) => moduleId.replace(/@angular\/([^\/]+)$/, '@angular/$1/index');
