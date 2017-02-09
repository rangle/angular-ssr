import {Type} from '@angular/core';

import {RenderRoute} from './route';
import {StateReader} from './state-reader';
import {TemplateDocument} from './template';
import {Variant, ComposedTransition} from './variance';

export interface RenderOperation<M, V> {
  template: TemplateDocument;
  moduleType: Type<M>;
  routes: Array<RenderRoute>;
  variance: Array<[V, ComposedTransition]>;
  stateReader?: StateReader;
}

export interface RenderVariantOperation<M, V> {
  scope: RenderOperation<M, V>;
  route: RenderRoute;
  variance: V;
  transition: ComposedTransition;
}