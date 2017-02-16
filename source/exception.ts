export class Exception extends Error {
  constructor(msg: string, private innerException?: Error) {
    super(msg);
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
export class ModuleException extends Exception {}
export class PathException extends Exception {}
export class PlatformException extends Exception {}
export class RendererException extends Exception {}
export class ResourceException extends Exception {}
export class RouteException extends Exception {}
export class SnapshotException extends Exception {}