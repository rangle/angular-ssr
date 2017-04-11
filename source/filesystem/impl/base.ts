import {basename} from 'path';

import {PathReference, FilesystemBase} from '../contracts';

import {FileType, typeFromPath} from '../type';

export abstract class FilesystemBaseImpl implements FilesystemBase {
  constructor(protected sourcePath: string) {}

  abstract parent(): PathReference;

  abstract exists(): boolean;

  name(): string {
    return basename(this.sourcePath);
  }

  type(): FileType {
    return typeFromPath(this.sourcePath);
  }

  equals(other: FilesystemBase): boolean {
    return other.toString() === this.toString();
  }
}