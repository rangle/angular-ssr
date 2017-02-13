import {RenderOperation} from './render';

import {Route, ComposedTransition} from 'renderer';

export interface RenderVariantOperation<M, V> {
  scope: RenderOperation<M, V>;
  route: Route;
  variance: V;
  transition: ComposedTransition;
}