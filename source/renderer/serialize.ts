import {NgModuleRef} from '@angular/core';

import {RenderDocument} from './render-document';

import {RenderException} from './exception';

export const serialize = <M, V>(moduleRef: NgModuleRef<M>): RenderDocument<V> => {
  throw new RenderException('Not implemented');
}