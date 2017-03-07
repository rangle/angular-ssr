import {Output} from './output';

import {Snapshot} from '../snapshot';

export class IpcOutput extends Output {
  initialize(): Promise<void> {
    throw new Error('Not implemented');
  }

  write<V>(snapshot: Snapshot<V>): Promise<void> {
    throw new Error('Not implemented');
  }
}