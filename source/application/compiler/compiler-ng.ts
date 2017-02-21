import {
  CompilerHost,
  NodeCompilerHostContext,
} from '@angular/compiler-cli';

import {PathMappedCompilerHost} from '@angular/compiler-cli/src/path_mapped_compiler_host';

import {createAotCompiler} from '@angular/compiler';

import {
  AngularCompilerOptions,
  MetadataWriterHost,
  NgcCliOptions
} from '@angular/tsc-wrapped';

import {
  CompilerHost as TsCompilerHost,
  Program
} from 'typescript';

import {CompileOptions} from './options';

export const compileTemplates = async (options: CompileOptions, program: Program, compilerHost: TsCompilerHost): Promise<[TsCompilerHost, Array<string>]> => {
  const hostContext = new NodeCompilerHostContext();

  const ngCompiler = compilerFactory(program, options.angular, hostContext);

  const cli = new NgcCliOptions({
    i18nFormat: null,
    i18nFile: null,
    locale: null,
    basePath: options.angular.basePath
  });

  const generatedModules = await generateAngularCode(program, ngCompiler, compilerHost, cli);

  const metadataWriter = new MetadataWriterHost(compilerHost, options.angular);

  metadataWriter.writeFile = compilerHost.writeFile;

  return [metadataWriter, generatedModules];
};

const generateAngularCode = async (program: Program, host: CompilerHost, compilerHost: TsCompilerHost, options: NgcCliOptions): Promise<Array<string>> => {
  const {compiler} = createAotCompiler(host, {
    debug: false,
    translations: null, // FIXME(cbond): Load from translation file
    i18nFormat: options.i18nFormat,
    locale: options.locale
  });

  const filenames = program.getSourceFiles().map(sf => host.getCanonicalFileName(sf.fileName));

  const generatedModules = await compiler.compileAll(filenames);

  return generatedModules.map(
    generatedModule => {
      const sourceFile = program.getSourceFile(generatedModule.srcFileUrl);
      const emitPath = host.calculateEmitPath(generatedModule.genFileUrl);
      compilerHost.writeFile(emitPath, generatedModule.source, false, function () {}, [sourceFile]);
      return emitPath;
    });
};

const compilerFactory = (program: Program, options: AngularCompilerOptions, context: NodeCompilerHostContext): CompilerHost => {
  var usePathMapping =
    options.rootDir ||
    options.rootDirs &&
    options.rootDirs.length > 0;

  return usePathMapping
    ? new PathMappedCompilerHost(program, options, context)
    : new CompilerHost(program, options, context);
};