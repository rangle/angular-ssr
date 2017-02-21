import {EOL} from 'os';

import {cwd} from 'process';

import {
  Diagnostic,
  FormatDiagnosticsHost,
  Program,
  formatDiagnostics,
  getPreEmitDiagnostics
} from 'typescript';

import {CompilerException} from 'exception';

import {flatten} from 'transformation';

export const diagnosticsToException = (diagnostics: Array<Diagnostic>): string => {
  const host: FormatDiagnosticsHost = {
    getCurrentDirectory: (): string => cwd(),
    getCanonicalFileName: (filename: string): string => filename,
    getNewLine: (): string => EOL,
  };

  return formatDiagnostics(diagnostics, host);
};

export const assertProgramDiagnostics = (program: Program) => {
  conditionalException(program.getOptionsDiagnostics());
  conditionalException(program.getGlobalDiagnostics());
  conditionalException(flatten<Diagnostic>(program.getSourceFiles().map(file => getPreEmitDiagnostics(program, file))));
};

export const conditionalException = (diagnostics: Array<Diagnostic>) => {
  if (diagnostics == null || diagnostics.length === 0) {
    return;
  }
  throw new CompilerException(diagnosticsToException(diagnostics));
}