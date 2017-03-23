import {Snapshot} from '../snapshot';

import {AggregateException, OutputException} from '../exception';

export abstract class OutputProducer {
  abstract initialize(): Promise<void>;

  abstract async write<V>(snapshot: Snapshot<V>): Promise<void>;

  abstract exception(exception: Error): void;

  protected assertValid<V>(snapshot: Snapshot<V>) {
    if (snapshot == null) {
      throw new OutputException('Cannot output a null application snapshot');
    }

    switch (snapshot.exceptions.length) {
      case 0: break;
      case 1: throw snapshot.exceptions[0];
      default:
        throw new AggregateException(snapshot.exceptions);
    }

    if (snapshot.renderedDocument == null ||
        snapshot.renderedDocument.length === 0) {
      throw new OutputException('Received an application snapshot with an empty document!');
    }
  }
}