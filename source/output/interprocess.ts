import {connected } from 'process';

import {ApplicationException} from '../exception';
import {OutputProducer} from './producer';
import {Snapshot} from '../snapshot';

export class InterprocessOutput implements OutputProducer {
  initialize() {
    if (connected === false) {
      throw new ApplicationException('This application is not connected to a parent application and therefore cannot use the IPC functionality');
    }
  }

  write<V>(snapshot: Snapshot<V>): Promise<void> {
    return Promise.resolve(process.send(snapshot));
  }

  exception(exception: Error) {
    console.error('Exception in rendering process', exception);
  }
}