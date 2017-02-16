import {
  CompilerHost,
  CodeGenerator,
  NodeCompilerHostContext,
} from '@angular/compiler-cli';

import {MetadataWriterHost, NgcCliOptions} from '@angular/tsc-wrapped';

import {
  CompilerHost as TsCompilerHost,
  Program,
  createProgram
} from 'typescript';

import {CompileOptions} from './options';

export const templateCompiler = async (options: CompileOptions, program: Program, compilerHost: TsCompilerHost): Promise<Program> => {
  const hostContext = new NodeCompilerHostContext();

  const ngCompiler = new CompilerHost(program, options.angularOptions, hostContext);

  const cli = new NgcCliOptions({
    i18nFormat: null,
    i18nFile: null,
    locale: null,
    basePath: options.angularOptions.basePath
  });

  const generator = CodeGenerator.create(options.angularOptions, cli, program, compilerHost, hostContext, ngCompiler);

  await generator.codegen();

  const metadataWriter = new MetadataWriterHost(compilerHost, options.angularOptions);

  metadataWriter.writeFile = compilerHost.writeFile;

  return createProgram(
    options.typescriptOptions.fileNames,
    options.typescriptOptions.options,
    metadataWriter,
    program);
};
