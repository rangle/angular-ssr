import {
  ConsoleStream,
  Logger,
  createLogger
} from 'scoped-logger';

export const log: Logger = createLogger(String(), [new ConsoleStream()]);