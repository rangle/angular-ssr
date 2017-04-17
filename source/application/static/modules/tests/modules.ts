import {join} from 'path';

import {
  CompilerOptions,
  Program,
  SourceFile,
  ScriptTarget,
  createCompilerHost,
  createProgram,
  createSourceFile,
} from 'typescript';

import {collectModules, discoverRootModule} from '..';

import {PathReference, pathFromRandomId} from '../../../../filesystem';

import {randomId} from '../../../../static';

describe('Module discovery', () => {
  const createExampleProgram = (root: PathReference): [string, Program] => {
    const moduleFile = sourceToSourceFile(root.toString(), `
      import {NgModule} from '@angular/core';

      @NgModule()
      export class RootModule {}
    `);

    const mainFile = sourceToSourceFile(root.toString(), `
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

    return [moduleFile.fileName, createProgram([moduleFile.fileName, mainFile.fileName], options, host)];
  };

  it('can locate root application module in a project', () => {
    const root = pathFromRandomId();
    const [moduleFile, program] = createExampleProgram(root);
    const descriptor = discoverRootModule(root, program);
    expect(descriptor).not.toBeNull();
    expect(descriptor.source).toEqual(moduleFile.replace(/(^(\\|\/)|\.ts$)/g, String()));
    expect(descriptor.symbol).toEqual('RootModule');
  });

  it('can discover all @NgModule classes in a project', () => {
    const root = pathFromRandomId();
    const [moduleFile, program] = createExampleProgram(root);
    const modules = collectModules(root, program);
    expect(modules).not.toBeNull();
    expect(modules.length).toBe(1);
    expect(modules[0].source).toEqual(moduleFile.replace(/\.(ts|js)$/i, String()));
    expect(modules[0].symbol).toEqual('RootModule');
  });
});

const sourceToSourceFile = (root: string, code: string): SourceFile => createSourceFile(join(root, `${randomId()}.ts`), code, ScriptTarget.ES5, true);