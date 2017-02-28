export class Exception extends Error {
  private innerException: Error;

  constructor(msg: string, innerException?: Error) {
    if (innerException) {
      super(`${msg} -> ${innerException.message}`);
    }
    else {
      super(msg);
    }

    this.innerException = innerException;
 }

  public get stack(): string {
    if (this.innerException) {
      return `${super.stack} -> ${this.innerException.stack}`;
    }

    return super.stack;
  }
}

export class ApplicationException extends Exception {}
export class CompilerException extends Exception {}
export class DiscoveryException extends Exception {}
export class FilesystemException extends Exception {}
export class ModuleException extends Exception {}
export class PlatformException extends Exception {}
export class RendererException extends Exception {}
export class ResourceException extends Exception {}
export class RouteException extends Exception {}
export class RuntimeException extends Exception {}
export class SnapshotException extends Exception {}
export class TranspileException extends Exception {}
