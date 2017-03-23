import {
  readFileSync,
  writeFileSync,
  unlinkSync,
} from 'fs';

import {FileType} from '../type';
import {FilesystemException} from '../../exception';
import {FilesystemBaseImpl} from './base';
import {PathReference, FileReference} from '../contracts';

export class FileImpl extends FilesystemBaseImpl implements FileReference {
  constructor(private owner: PathReference, sourcePath: string) {
    super(sourcePath);
  }

  exists(): boolean {
    return this.type() !== FileType.Unknown;
  }

  parent(): PathReference {
    return this.owner;
  }

  create(content: string) {
    writeFileSync(this.toString(), content, {flag: 'w'});

    this.cachedContent = content;
  }

  private cachedContent: string;

  content(): string {
    if (this.cachedContent === undefined) {
      if (this.type() !== FileType.File) {
        throw new FilesystemException(`Path is not a file: ${this.toString()}`);
      }
      try {
        this.cachedContent = readFileSync(this.toString()).toString();
      }
      catch (exception) {
        throw new FilesystemException(`Failed to read file: ${this.toString()}: ${exception.toString()}`, exception);
      }
    }

    return this.cachedContent;
  }

  assert() {
    if (this.exists() === false) {
      throw new FilesystemException(`FileReference is nonexistent: ${this.sourcePath}`);
    }
  }

  unlink() {
    try {
      unlinkSync(this.toString());
    }
    catch (exception) {}
  }

  toString() {
    return this.sourcePath;
  }
}
