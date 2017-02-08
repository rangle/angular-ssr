import {RenderDocument} from '../renderer';

export class RenderCache<Variants> {
  query(options: Variants): RenderDocument<Variants> {
    throw new Error('Not implemented');
  }
}
