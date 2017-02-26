import {basename} from 'path';

import {PathReference, FilesystemBase} from './contracts';

import {FilesystemType} from './type';

export abstract class FilesystemBaseImpl implements FilesystemBase {
  constructor(protected sourcePath: string) {}

  abstract parent(): PathReference;

  abstract exists(): boolean;

  name(): string {
    return basename(this.sourcePath);
  }

  type(): FilesystemType {
    return new FilesystemType(this.sourcePath);
  }
}