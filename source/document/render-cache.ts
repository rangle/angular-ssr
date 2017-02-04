import {RenderedDocument} from '../document';

export class RenderCache<V> {
  query(options: V): RenderedDocument<V> {
    throw new Error('Not implemented');
  }
}
