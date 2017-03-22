import {EOL} from 'os';

import {cwd} from 'process';

import {
  Diagnostic,
  DiagnosticCategory,
  FormatDiagnosticsHost,
  Program,
  formatDiagnostics,
  getPreEmitDiagnostics
} from 'typescript';

import {CompilerException} from '../../exception';

import {flatten} from '../../transformation';

export const diagnosticsToException = (diagnostics: Array<Diagnostic>): string => {
  const host: FormatDiagnosticsHost = {
    getCurrentDirectory: (): string => cwd(),
    getCanonicalFileName: (filename: string): string => filename,
    getNewLine: (): string => EOL,
  };

  return formatDiagnostics(diagnostics, host);
};

export const assertProgram = (program: Program) => {
  assertDiagnostics(program.getOptionsDiagnostics());
  assertDiagnostics(program.getGlobalDiagnostics());
  assertDiagnostics(program.getSemanticDiagnostics());
  assertDiagnostics(program.getSyntacticDiagnostics());
  assertDiagnostics(program.getDeclarationDiagnostics());
  assertDiagnostics(flatten<Diagnostic>(program.getSourceFiles().map(file => getPreEmitDiagnostics(program, file))));
};

export const assertDiagnostics = (diagnostics: Array<Diagnostic>) => {
  diagnostics = (diagnostics || []).filter(d => d.category === DiagnosticCategory.Error);

  if (diagnostics.length > 0) {
    throw new CompilerException(diagnosticsToException(diagnostics));
  }
}