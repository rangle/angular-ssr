import {Snapshot} from '../snapshot';

export interface OutputProducer {
  initialize(): Promise<void>;

  write<V>(snapshot: Snapshot<V>): Promise<void>;

  exception(exception: Error): void;
}