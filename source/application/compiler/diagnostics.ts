import {EOL} from 'os';
import {cwd} from 'process';

import {
  Diagnostic,
  FormatDiagnosticsHost,
  formatDiagnostics
} from 'typescript';

export const diagnosticsToException = (diagnostics: Array<Diagnostic>): string => {
  const host: FormatDiagnosticsHost = {
      getCurrentDirectory: (): string => cwd(),
      getCanonicalFileName: (filename: string): string => filename,
      getNewLine: (): string => EOL,
  };

  return formatDiagnostics(diagnostics, host);
};