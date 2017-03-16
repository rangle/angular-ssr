import {
  ConsoleStream,
  Logger,
  createLogger
} from 'scoped-logger';

export const logger: Logger = createLogger(String(), [new ConsoleStream()]);