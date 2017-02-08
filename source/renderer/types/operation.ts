import {Type} from '@angular/core';

import {RenderRoute} from './route';

import {StateExtractor} from './state';

import {VariantWithTransformer} from '../../variant';

export interface RenderOperation<M, V> {
  moduleType: Type<M>;

  routes: Array<RenderRoute>;

  variants: Array<VariantWithTransformer<V>>;

  extractState?: StateExtractor;
}

export interface RenderVariantOperation<M, V> {
  parentOperation: RenderOperation<M, V>;

  route: RenderRoute;

  transformer: VariantWithTransformer<V>;
}