import {
  existsSync,
  readFileSync,
  realpathSync
} from 'fs';

import {FileType, FilesystemType} from './type';
import {FilesystemException} from '../exception';
import {FilesystemBaseImpl} from './base';
import {PathReference, FileReference} from './contracts';

export class FileImpl extends FilesystemBaseImpl implements FileReference {
  constructor(private owner: PathReference, sourcePath: string) {
    super(sourcePath);
  }

  exists(): boolean {
    const type = this.type();

    if (type.is(FileType.File) === false) {
      return false;
    }

    const dereferencedPath =
      type.is(FileType.SymbolicLink)
        ? realpathSync(this.sourcePath)
        : this.sourcePath;

    return existsSync(dereferencedPath);
  }

  dereference(): FileReference {
    this.assert();

    let type = this.type();

    let realpath = this.sourcePath;

    while (type.is(FileType.SymbolicLink)) {
      realpath = realpathSync(realpath);

      type = new FilesystemType(realpath);
    }

    if (type.is(FileType.SymbolicLink) === false) {
      return new FileImpl(this.owner, realpath); // retains same owner as the symlink is our sibling
    }

    throw new FilesystemException(`Dereference of ${this.sourcePath} reached a dead end at ${realpath}`);
  }

  parent(): PathReference {
    return this.owner;
  }

  private cachedContent: string;

  content(): string {
    if (this.cachedContent === undefined) {
      const dereferenced = this.dereference();

      if (dereferenced.type().is(FileType.File) === false) {
        throw new FilesystemException(`Cannot read a file of type ${this.type().description()}`);
      }
      try {
        this.cachedContent = readFileSync(dereferenced.toString()).toString();
      }
      catch (exception) {
        const fromLink = `from symbolic link: ${this.sourcePath}`;

        const fromType = `type: ${this.type().description()}`;

        const resolvedFrom =
          dereferenced !== this
            ? fromLink
            : fromType;

        throw new FilesystemException(`Failed to read file: ${dereferenced} (from: ${resolvedFrom})`, exception);
      }
    }

    return this.cachedContent;
  }

  assert() {
    if (this.exists() === false) {
      throw new FilesystemException(`FileReference is nonexistent: ${this.sourcePath}`);
    }
  }

  toString() {
    return this.sourcePath;
  }
}
