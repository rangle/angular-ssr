import {statSync} from 'fs';

export enum FileType {
  Unknown,
  Directory,
  File,
  Socket
}

export const typeFromPath = (path: string): FileType => {
  try {
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return FileType.Directory;
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
};
