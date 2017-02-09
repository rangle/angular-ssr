import {Type} from '@angular/core';

import {Route} from '../route';

import {StateReader} from './state-reader';

import {TemplateDocument} from './template';

import {
  ComposedTransition,
  Variant
} from '../variance';

export interface RenderOperation<M, V> {
  template: TemplateDocument;
  moduleType: Type<M>;
  routes: Array<Route>;
  variance: Map<V, ComposedTransition>;
  stateReader?: StateReader;
}

export interface RenderVariantOperation<M, V> {
  scope: RenderOperation<M, V>;
  route: Route;
  variance: V;
  transition: ComposedTransition;
}