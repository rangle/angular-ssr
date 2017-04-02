import {EOL} from 'os';
import chalk = require('chalk');

export class Exception extends Error {
  constructor(msg: string, public innerException?: Error) {
    super(innerException ? `${msg} -> ${innerException.stack}` : chalk.red(msg));
 }
}

export class AggregateException extends Exception {
  constructor(public exceptions: Array<Exception | Error>) {
    super(chalk.red(`Multiple exceptions occurred (${exceptions.length}) [${exceptions.map(e => e.stack).join(', ')}]`));
  }

  get stack(): string {
    return this.exceptions.map(e => e.stack).join(EOL);
  }

  toString() {
    return this.exceptions.map(e => e.toString()).join(EOL);
  }
}

export class NotImplementedException extends Exception {
  constructor() {
    super(chalk.red('Not implemented'));
  }
}

export class ApplicationException extends Exception {}
export class CompilerException extends Exception {}
export class ConfigurationException extends Exception {}
export class DiscoveryException extends Exception {}
export class FilesystemException extends Exception {}
export class ModuleException extends Exception {}
export class OutputException extends Exception {}
export class PlatformException extends Exception {}
export class RendererException extends Exception {}
export class ResourceException extends Exception {}
export class RouteException extends Exception {}
export class SnapshotException extends Exception {}
export class TranspileException extends Exception {}
