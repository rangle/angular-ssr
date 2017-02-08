import {Type} from '@angular/core';

import {RenderRoute} from './route';

import {StateExtractor} from './state';

import {VariantWithTransformer} from '../../variant';

export interface RenderOperation<M, V> {
  moduleType: Type<M>;

  routes: Iterable<RenderRoute>;

  variants: Iterable<VariantWithTransformer<V>>;

  extractState?: StateExtractor;
}