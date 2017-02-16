import {
  NgModuleFactory,
  NgModule
} from '@angular/core';

import {
  CompilerOptions,
  Diagnostic,
  ModuleKind,
  ModuleResolutionKind,
  Program,
  WriteFileCallback,
  createCompilerHost,
  createProgram,
  getPreEmitDiagnostics,
} from 'typescript';

import {dirname} from 'path';

import {CompileOptions, loadProjectOptions} from './options';
import {CompilerException} from 'exception';
import {Project} from '../project';
import {Reflector} from 'platform';
import {VirtualMachine} from './vm';
import {diagnosticsToException} from './diagnostics';
import {flatten} from 'transformation';

export class Compiler {
  private options: CompileOptions;

  constructor(private project: Project) {
    this.options = loadProjectOptions(project);

    if (project.ngModule == null ||
        project.ngModule.length < 2) {
      throw new CompilerException('Compiler requires a module ID and an export name in ngModule');
    }
  }

  compile(): NgModuleFactory<any> {
    const vm = new VirtualMachine();
    try {
      this.compileToVm(vm);

      const [moduleId, exported] = this.project.ngModule;

      const requiredModule = vm.require(moduleId);
      if (requiredModule == null) {
        throw new CompilerException(`Attempted to require ${moduleId} but received a null or undefined object`);
      }

      const rootModule =
        !exported
          ? requiredModule
          : requiredModule[exported];

      if (Reflector.decorated(rootModule, NgModule) === false) {
        throw new CompilerException(`Root module type ${rootModule.name} is not decorated with @NgModule`);
      }

      return rootModule;
    }
    finally {
      vm.dispose();
    }
  }

  private compileToVm(vm: VirtualMachine) {
    const program = this.createProgram(null);

    const compilerOptions = program.getCompilerOptions();

    const writer: WriteFileCallback =
      (fileName, data, writeByteOrderMark, onError?, sourceFiles?) => {
        try {
          const moduleId = this.moduleIdFromFilename(fileName, compilerOptions);

          vm.define(fileName, moduleId, data);
        }
        catch (exception) {
          if (onError == null) {
            throw exception;
          }
          onError(exception.stack);
        }
      };

    program.emit(undefined, writer, null, false);
  }

  private createProgram(previousProgram?: Program): Program {
    const {typescriptOptions} = this.options;

    const options = Object.assign({}, typescriptOptions.options, {
      declaration: false,
      sourceMap: false,
      sourceRoot: null,
      inlineSourceMap: false,
      module: ModuleKind.CommonJS,
      moduleResolution: ModuleResolutionKind.NodeJs,
    });

    const compilerHost = createCompilerHost(options, true);

    const program = createProgram(
      typescriptOptions.fileNames,
      options,
      compilerHost,
      previousProgram);

    this.assertions(program);

    return program;
  }

  private assertions(program: Program) {
    this.conditionalException(program.getOptionsDiagnostics());
    this.conditionalException(program.getGlobalDiagnostics());
    this.conditionalException(flatten<Diagnostic>(program.getSourceFiles().map(file => getPreEmitDiagnostics(program, file))));
  }

  private conditionalException(diagnostics: Array<Diagnostic>) {
    if (diagnostics == null ||
        diagnostics.length === 0) {
      return;
    }
    throw new CompilerException(diagnosticsToException(diagnostics));
  }

  private moduleIdFromFilename(filename: string, compilerOptions: CompilerOptions): string {
    const projectPath = (path: string): string =>
      path.toLowerCase().endsWith('.json')
        ? dirname(path)
        : path;

    const candidates = [
      compilerOptions.baseUrl,
      compilerOptions.outDir,
      compilerOptions.rootDir,
      compilerOptions.project
        ? projectPath(compilerOptions.project)
        : null,
    ].concat(compilerOptions.rootDirs || []).filter(v => v);

    const lowerfile = filename.toLowerCase();

    const matches = candidates.map(v => v.toLowerCase()).filter(p => lowerfile.startsWith(p));
    if (matches.length > 0) {
      return filename.substring(matches[0].length)
        .replace(/\.js$/, String())
        .replace(/^\//, String());
    }

    throw new CompilerException(`Cannot determine module ID of file ${filename}`);
  }
}