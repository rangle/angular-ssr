import {
  CodeGenerator,
  NodeCompilerHostContext,
} from '@angular/compiler-cli';

import {
  MetadataWriterHost,
  NgcCliOptions
} from '@angular/tsc-wrapped';

import {
  CompilerHost as TsCompilerHost,
  Program,
} from 'typescript';

import {TranslatingCompilerHost} from './compiler-translate';

import {CompileOptions} from './options';

export const templateCompiler = async (options: CompileOptions, program: Program, compilerHost: TsCompilerHost): Promise<TsCompilerHost> => {
  const hostContext = new NodeCompilerHostContext();

  const ngCompiler = new TranslatingCompilerHost(program, options.angular, hostContext);

  const cli = new NgcCliOptions({
    i18nFormat: null,
    i18nFile: null,
    locale: null,
    basePath: options.angular.basePath
  });

  const generator = CodeGenerator.create(options.angular, cli, program, compilerHost, hostContext, ngCompiler);

  await generator.codegen();

  const metadataWriter = new MetadataWriterHost(compilerHost, options.angular);

  metadataWriter.writeFile = compilerHost.writeFile;

  return metadataWriter;
};
