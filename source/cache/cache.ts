import {Snapshot} from '../renderer';

export class RenderCache<V> {
  query(variant: V): Snapshot<V> {
    throw new Error('Not implemented');
  }
}
