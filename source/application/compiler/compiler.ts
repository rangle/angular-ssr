import {NgModuleFactory} from '@angular/core';

import {
  CompilerHost,
  Program,
  createCompilerHost,
  createProgram,
} from 'typescript';

import {
  CompileOptions,
  loadProjectOptions,
  moduleIdFromFilename
} from './options';

import {
  assertProgramDiagnostics,
  conditionalException
} from './diagnostics';

import {CompilerVmHost} from './compiler-vm';
import {Project} from '../project';
import {VirtualMachine} from './vm';
import {templateCompiler} from './template';
import {CompilerException} from 'exception';

export class Compiler {
  private options: CompileOptions;

  constructor(private project: Project) {
    this.options = loadProjectOptions(project);

    if (project.rootModule == null ||
        !project.rootModule.source ||
        !project.rootModule.symbol) {
      throw new CompilerException('Compilation requires a source and symbol');
    }
  }

  async compile(): Promise<NgModuleFactory<any>> {
    const vm = new VirtualMachine();
    try {
      await this.compileToVm(vm);

      const {source, symbol} = this.project.rootModule;

      return this.requireModule(vm, source, symbol);
    }
    finally {
      vm.dispose();
    }
  }

  private async compileToVm(vm: VirtualMachine): Promise<void> {
    const compilerHost = createCompilerHost(this.options.ts, true);

    const program = this.createProgram(this.options.rootSources, compilerHost);

    compilerHost.writeFile = (file, data) => this.write(vm, file, data);

    const metadataWriter = await templateCompiler(this.options, program, compilerHost);

    const compilerVmHost = new CompilerVmHost(this.project, vm, metadataWriter);

    const vmoptions = compilerVmHost.vmoptions();

    const templatedProgram = this.createProgram(vmoptions.fileNames, compilerVmHost, program);

    const emitResult = templatedProgram.emit(undefined, (file, data) => this.write(vm, file, data), null, false);
    if (emitResult) {
      conditionalException(emitResult.diagnostics);
    }
  }

  private write(vm: VirtualMachine, fileName: string, data: string) {
    const {angular} = this.options;

    const moduleId = moduleIdFromFilename(this.project.basePath, fileName, angular);

    vm.define(fileName, moduleId, data);
  }

  private createProgram(files: Array<string>, compilerHost: CompilerHost, previousProgram?: Program): Program {
    const program = createProgram(
      files,
      this.options.ts,
      compilerHost,
      previousProgram);

    assertProgramDiagnostics(program);

    return program;
  }

  private async requireModule(vm: VirtualMachine, source: string, symbol: string) {
    const requiredModule = vm.require(this.sourceToNgFactory(source));

    const definition = this.symbolToNgFactory(symbol);

    if (requiredModule[definition] == null) {
      throw new CompilerException(`Module ${source} does not export a ${definition} symbol`);
    }

    return requiredModule[definition];
  }

  private sourceToNgFactory(source: string): string {
    if (/\.ngfactory(\.(ts|js))?$/.test(source) === false) {
      return `${source}.ngfactory`;
    }
    return source;
  }

  private symbolToNgFactory(symbol: string): string {
    if (/NgFactory$/.test(symbol) === false) {
      return `${symbol}NgFactory`;
    }
    return symbol;
  }
}