import {connected } from 'process';

import {RuntimeException} from '../exception';
import {OutputProducer} from './producer';
import {Snapshot} from '../snapshot';

export class InterprocessOutput implements OutputProducer {
  initialize() {
    if (connected === false) {
      throw new RuntimeException('This application is not connected to a parent application and therefore cannot use the IPC functionality');
    }
  }

  async write<V>(snapshot: Snapshot<V>): Promise<void> {
    this.send(snapshot);
  }

  async exception(exception: Error) {
    this.send({
      exception: {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        originalStack: exception.originalStack,
        zoneAwareStack: exception.zoneAwareStack
      }});
  }

  private send<T>(message: T) {
    if (process.send == null) {
      throw new RuntimeException(`Process (${process.pid}) is not connected to a parent process`);
    }
    return Promise.resolve(process.send(message));
  }
}