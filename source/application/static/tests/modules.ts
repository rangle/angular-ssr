import {join} from 'path';

import {
  CompilerOptions,
  SourceFile,
  ScriptTarget,
  createCompilerHost,
  createProgram,
  createSourceFile,
} from 'typescript';

import {discoverRootModule} from '../root-module';

import {pathFromRandomId} from '../../../filesystem';

import {randomId} from '../../../static';

describe('discoverRootModule', () => {
  it('can discover root application module from TypeScript source', () => {
    const root = pathFromRandomId().toString();

    const moduleFile = sourceToSourceFile(root, `
      import {NgModule} from '@angular/core';

      @NgModule()
      export class RootModule {}
    `);

    const mainFile = sourceToSourceFile(root, `
      import {RootModule} from './${moduleFile.fileName.replace(/\.ts$/, String())}';

      platformBrowserDynamic().bootstrapModule(RootModule);
    `);

    const options: CompilerOptions = {target: ScriptTarget.ES5};

    const host = createCompilerHost(options);

    const getSourceFile = host.getSourceFile.bind(host);

    host.getSourceFile = (filename, languageVersion) => {
      switch (filename) {
        case moduleFile.fileName:
          return moduleFile;
        case mainFile.fileName:
          return mainFile;
        default:
          return getSourceFile(filename, languageVersion);
      }
    };

    host.fileExists = filename => filename === moduleFile.fileName || filename === mainFile.fileName;

    const program = createProgram([moduleFile.fileName, mainFile.fileName], options, host);

    const descriptor = discoverRootModule(root, program);
    expect(descriptor).not.toBeNull();
    expect(descriptor.source).toEqual(moduleFile.fileName.replace(/(^(\\|\/)|\.ts$)/g, String()));
    expect(descriptor.symbol).toBe('RootModule');
  });
});

const sourceToSourceFile = (root: string, code: string): SourceFile =>
  createSourceFile(join(root, `${randomId()}.ts`), code, ScriptTarget.ES5, true);