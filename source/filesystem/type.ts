import {statSync, realpathSync} from 'fs';

export enum FilesystemType {
  Unknown      = 0x0,
  Directory    = 0x1,
  File         = 0x2,
  SymbolicLink = 0x4,
  Socket       = 0x8,
}

export const fstype = (path: string): FilesystemType => {
  const stats = statSync(path);

  if (stats.isDirectory()) {
    return FilesystemType.Directory;
  }
  else if (stats.isSymbolicLink()) {
    return FilesystemType.SymbolicLink | fstype(realpathSync(path));
  }
  else if (stats.isFile()) {
    return FilesystemType.File;
  }
  else if (stats.isSocket()) {
    return FilesystemType.Socket;
  }
  else {
    return FilesystemType.Unknown;
  }
};