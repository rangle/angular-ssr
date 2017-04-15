import {Snapshot} from '../snapshot';

export interface OutputProducer {
  initialize(): void;

  write<V>(snapshot: Snapshot<V>): Promise<void>;

  exception(exception: Error): Promise<void>;
}