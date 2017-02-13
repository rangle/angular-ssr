import {ComposedTransition} from 'variance';

import {RenderOperation} from './render';

import {Route} from '../route';

export interface RenderVariantOperation<M, V> {
  scope: RenderOperation<M, V>;
  route: Route;
  variant: V;
  transition: ComposedTransition;
}