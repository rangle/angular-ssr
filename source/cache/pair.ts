import {Snapshot} from '../snapshot';

export class Pair<V> {
  snapshot: Snapshot<V>;
  time: number;
}