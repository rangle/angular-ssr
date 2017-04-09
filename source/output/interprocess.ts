import {NotImplementedException} from '../exception';
import {OutputProducer} from './producer';
import {Snapshot} from '../snapshot';

export class InterprocessOutput implements OutputProducer {
  initialize(): Promise<void> {
    throw new NotImplementedException();
  }

  write<V>(snapshot: Snapshot<V>): Promise<void> {
    throw new NotImplementedException();
  }

  exception(exception: Error) {
    throw new NotImplementedException();
  }
}