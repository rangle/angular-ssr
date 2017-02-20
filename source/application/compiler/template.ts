import {
  CompilerHost,
  CodeGenerator,
  NodeCompilerHostContext,
} from '@angular/compiler-cli';

import {MetadataWriterHost, NgcCliOptions} from '@angular/tsc-wrapped';

import {
  CompilerHost as TsCompilerHost,
  Program,
} from 'typescript';

import {CompileOptions} from './options';

export const templateCompiler = async (options: CompileOptions, program: Program, compilerHost: TsCompilerHost): Promise<TsCompilerHost> => {
  const hostContext = new NodeCompilerHostContext();

  const ngCompiler = new CompilerHost(program, options.angularOptions, hostContext);

  ngCompiler.calculateEmitPath = (filePath: string) => filePath;

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

  return metadataWriter;
};
