import {statSync, realpathSync} from 'fs';

export enum FilesystemType {
  Unknown      = 0x0,
  SymbolicLink = 0x1,
  Directory    = 0x2,
  File         = 0x4,
  Socket       = 0x8,
}

export interface PathType {
  // Check for a particular bit flag from FilesystemType
  is(type: FilesystemType): boolean;

  // A plaintext description of this path
  description(): string;

  // All combined types of this file. For example, a symbolic link which
  // points to a real directory will have this combination of type bits:
  //
  // {@code FilesystemType.SymbolicLink | FilesystemType.Directory}
  type(): FilesystemType;
}

export const fstype = (path: string): PathType => {
  const type = pathToType(path);

  return {
    type: () => {
      return type;
    },
    is: (flag: FilesystemType) => {
      return (type & flag) !== 0;
    },
    description: (): string => {
      const types =
        Object.keys(FilesystemType)
          .filter(k => /^(\d+)$/.test(k) === false)
          .filter(k => (type & parseInt(FilesystemType[k], 10)) !== 0);

      const descriptions = types.map(k => k.replace(/[A-Z]/g, c => ` ${c.toLowerCase()}`).trim());

      return descriptions.join(' -> ');
    }
  };
}

const pathToType = (path: string): FilesystemType => {
  try {
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return FilesystemType.Directory;
    }
    else if (stats.isSymbolicLink()) {
      return FilesystemType.SymbolicLink | fstype(realpathSync(path)).type();
    }
    else if (stats.isFile()) {
      return FilesystemType.File;
    }
    else if (stats.isSocket()) {
      return FilesystemType.Socket;
    }
  }
  catch (exception) {}

  return FilesystemType.Unknown;
};