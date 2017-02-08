import {Type} from '@angular/core';

import {RenderRoute} from './route';
import {StateReader} from './state-reader';
import {TemplateDocument} from './template';
import {VariantWithTransformer} from '../../variant';

export interface RenderOperation<M, V> {
  template: TemplateDocument;
  moduleType: Type<M>;
  routes: Array<RenderRoute>;
  variants: Array<VariantWithTransformer<V>>;
  extractState?: StateReader;
}

export interface RenderVariantOperation<M, V> {
  scope: RenderOperation<M, V>;
  route: RenderRoute;
  transform: VariantWithTransformer<V>;
}