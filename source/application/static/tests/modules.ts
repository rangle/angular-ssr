import {join} from 'path';

import {
  CompilerOptions,
  SourceFile,
  ScriptTarget,
  createCompilerHost,
  createProgram,
  createSourceFile,
} from 'typescript';

import {discoverApplicationModule} from '../modules';

import {getTemporaryWorkingPath} from './../../project';

import {randomId} from './../../../identifiers';

describe('static analysis', () => {
  const root = getTemporaryWorkingPath().toString();

  it('can discover root application module', () => {
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

    host.fileExists = f => f === moduleFile.fileName || f === mainFile.fileName;

    const getSourceFile = host.getSourceFile.bind(host);

    host.getSourceFile = (f, l) => {
      switch (f) {
        case moduleFile.fileName:
          return moduleFile;
        case mainFile.fileName:
          return mainFile;
        default:
          return getSourceFile(f, l);
      }
    };

    const program = createProgram([moduleFile.fileName, mainFile.fileName], options, host);

    const descriptor = discoverApplicationModule(root, program);
    expect(descriptor).not.toBeNull();
    expect(descriptor.source).toEqual(moduleFile.fileName.replace(/(^(\\|\/)|\.ts$)/g, String()));
    expect(descriptor.symbol).toBe('RootModule');
  });
});

const sourceToSourceFile = (root: string, code: string): SourceFile =>
  createSourceFile(join(root, `${randomId()}.ts`), code, ScriptTarget.ES5, true);