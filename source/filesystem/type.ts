import {statSync, realpathSync} from 'fs';

export enum FileType {
  Unknown      = 0x0,
  SymbolicLink = 0x1,
  Directory    = 0x2,
  File         = 0x4,
  Socket       = 0x8,
}

export class FilesystemType {
  constructor(private path: string) {}

  private bits: FileType = null;

  is(flags: FileType): boolean {
    return (this.type() & flags) !== 0;
  }

  description(): string {
    const type = this.type();

    const types =
      Object.keys(FileType)
        .filter(k => /^(\d+)$/.test(k) === false)
        .filter(k => (type & parseInt(FileType[k], 10)) !== 0);

    const descriptions = types.map(k => k.replace(/[A-Z]/g, c => ` ${c.toLowerCase()}`).trim());

    return descriptions.join(' -> ');
  }

  type(): FileType {
    if (this.bits == null) {
      this.bits = FilesystemType.evaluateType(this.path);
    }
    return this.bits;
  }

  static evaluateType(path: string): FileType {
    try {
      const stats = statSync(path);

      if (stats.isDirectory()) {
        return FileType.Directory;
      }
      else if (stats.isSymbolicLink()) {
        return FileType.SymbolicLink | FilesystemType.evaluateType(realpathSync(path));
      }
      else if (stats.isFile()) {
        return FileType.File;
      }
      else if (stats.isSocket()) {
        return FileType.Socket;
      }
    }
    catch (exception) {}

    return FileType.Unknown;
  }
}
