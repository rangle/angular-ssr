import {
  existsSync,
  readFileSync,
  realpathSync
} from 'fs';

import {
  FilesystemType,
  PathType,
  fstype
} from './type';

import {FilesystemException} from '../exception';

export const fileFromString = (filePath: string): File => new File(filePath);

export class File {
  constructor(private sourcePath: string) {}

  private cachedContent: string;

  assertExistence() {
    if (this.exists() === false) {
      throw new FilesystemException(`Cannot read a nonexistent file: ${this.sourcePath}`);
    }
  }

  type(): PathType {
    return fstype(this.sourcePath);
  }

  path(): string {
    return this.sourcePath;
  }

  exists(): boolean {
    const type = this.type();
    if (type.is(FilesystemType.File) !== true) {
      throw new FilesystemException(`Expected a file but received a ${type.description()}: ${this.sourcePath}`)
    }

    const dereferencedPath =
      type.is(FilesystemType.SymbolicLink)
        ? realpathSync(this.sourcePath)
        : this.sourcePath;

    return existsSync(dereferencedPath);
  }

  dereference(): File {
    this.assertExistence();

    if (this.type().is(FilesystemType.SymbolicLink)) {
      const realpath = realpathSync(this.sourcePath);

      return new File(realpath);
    }

    return this;
  }

  content(): string {
    if (this.cachedContent == null) {
      const dereferenced = this.dereference();

      if (dereferenced.type().is(FilesystemType.File) === false) {
        throw new FilesystemException(`Cannot read a file of type ${this.type().description()}`);
      }
      try {
        this.cachedContent = readFileSync(dereferenced.path()).toString();
      }
      catch (exception) {
        const resolvedFrom =
          dereferenced !== this
            ? `from symbolic link: ${this.sourcePath}`
            : `type: ${this.type().description()}`;

        throw new FilesystemException(`Failed to read file: ${dereferenced.path()} (from: ${resolvedFrom})`, exception);
      }
    }

    return this.cachedContent;
  }
}