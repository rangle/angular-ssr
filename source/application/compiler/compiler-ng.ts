import {
  CompilerHost,
  NodeCompilerHostContext,
  StaticReflector
} from '@angular/compiler-cli';

import {PathMappedCompilerHost} from '@angular/compiler-cli/src/path_mapped_compiler_host';

import {createAotCompiler} from '@angular/compiler/index';

import {
  AngularCompilerOptions,
  MetadataWriterHost,
  NgcCliOptions,
} from '@angular/tsc-wrapped';

import {
  CompilerHost as TsCompilerHost,
  Program
} from 'typescript';

import {CompileOptions, rootDirectories} from './options';

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
  const {compiler, reflector} = createAotCompiler(host, {
    debug: false,
    translations: null, // FIXME(cbond): Load from translation file
    i18nFormat: options.i18nFormat,
    locale: options.locale
  });

  patchReflectorToRemoveBrowserModule(reflector);

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
  const compiler = rootDirectories(options.basePath, options).length > 0
    ? new PathMappedCompilerHost(program, options, context)
    : new CompilerHost(program, options, context);

  return compiler;
};

const patchReflectorToRemoveBrowserModule = (reflector: StaticReflector) => {
  const originalAnnotations = reflector.annotations.bind(reflector);

  reflector.annotations = type => {
    const original = originalAnnotations(type);

    for (const decorator of original) {
      if (decorator.toString() !== '@NgModule' ||
          decorator.imports == null ||
          decorator.imports.length === 0) {
        continue;
      }

      const browserIndex = decorator.imports.findIndex(s => s.name === 'BrowserModule');
      if (browserIndex < 0) {
        continue;
      }

      decorator.imports.splice(browserIndex, 1);

      if (decorator.imports.find(i => i.name === 'ApplicationModule') == null) {
        const identifier = reflector.resolveIdentifier('ApplicationModule', '@angular/core/src/application_module');
        decorator.imports.push(identifier);
      }

      if (decorator.imports.find(i => i.name === 'CommonModule') == null) {
        const identifier = reflector.resolveIdentifier('CommonModule', '@angular/common/src/common_module');
        decorator.imports.push(identifier);
      }
    }

    return original;
  };
};