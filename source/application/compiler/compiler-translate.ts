import {
  AngularCompilerOptions,
  CompilerHost,
  CompilerHostContext
} from '@angular/compiler-cli';

import {Program} from 'typescript';

import {join, normalize, relative} from 'path';

export class TranslatingCompilerHost extends CompilerHost {
  constructor(
    program: Program,
    options: AngularCompilerOptions,
    context: CompilerHostContext
  ) {
    super(program, options, context);
  }

  calculateEmitPath(filename: string): string {
    const root = this.getRootSourcePath();
    if (root) {
      return join(root, this.derelativize(relative(root, filename)));
    }
    return super.calculateEmitPath(filename);
  }

  fileNameToModuleName(filename: string, containingFile?: string): string {
    if (/ngfactory/.test(filename)) {
      const root = this.getRootSourcePath();
      if (root) {
        const path = this.derelativize(relative(root, filename));
        return path.replace(/\.(d\.ts|ts|js)$/, String());
      }
    }
    return super.fileNameToModuleName(filename, containingFile);
  }

  private getRootSourcePath() {
    const {rootDir, rootDirs, genDir, baseUrl} = this.options;

    return [rootDir].concat(rootDirs || [], genDir, baseUrl).find(c => !!c);
  }

  private derelativize(path: string): string {
    path = normalize(path);
    while (/^\.\./.test(path)) {
      path = path.replace(/^\.\.(\\|\/)/, String());
    }
    return path;
  }
}