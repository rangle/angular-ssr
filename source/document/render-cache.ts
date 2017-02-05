import {RenderedDocument} from '../document';

export class RenderCache<Variants> {
  query(options: Variants): RenderedDocument<Variants> {
    throw new Error('Not implemented');
  }
}
