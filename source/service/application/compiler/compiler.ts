import {
  Diagnostic,
  FormatDiagnosticsHost,
  Program,
  SourceFile,
  WriteFileCallback,
  createCompilerHost,
  createProgram,
  formatDiagnostics,
  getPreEmitDiagnostics,
} from 'typescript';

import {EOL} from 'os';
import {cwd} from 'process';
import {relative} from 'path';

import {ApplicationBundle} from './bundle';
import {CompilerOptions, loadProjectOptions} from './options';
import {CompilerException} from 'exception';
import {Project} from '../project';

import {flatten} from 'transformation';

export class Compiler {
  private options: CompilerOptions;

  constructor(project: Project) {
    this.options = loadProjectOptions(project);
  }

  async compile(): Promise<ApplicationBundle> {
    const program = this.createProgram(null);

    return new Promise(resolve => {
      const writer: WriteFileCallback =
        (fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void, sourceFiles?: SourceFile[]) => {
          throw new CompilerException('Not implemented');
        };

      program.emit(undefined, writer, null, false);
    });
  }

  private createProgram(previousProgram?: Program): Program {
    const {typescriptOptions} = this.options;

    const compilerHost = createCompilerHost(typescriptOptions.options, true);

    const program = createProgram(
      typescriptOptions.fileNames,
      typescriptOptions.options,
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
    if (diagnostics == null || diagnostics.length === 0) {
      return;
    }

    const host: FormatDiagnosticsHost = {
       getCurrentDirectory: (): string => cwd(),
       getCanonicalFileName: (filename: string): string => relative(cwd(), filename),
       getNewLine: (): string => EOL,
    };

    const formatted = formatDiagnostics(diagnostics, host);

    throw new CompilerException(formatted);
  }
}