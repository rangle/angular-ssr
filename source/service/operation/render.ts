import {Injector, Type} from '@angular/core';

import {ComposedTransition} from 'variance';

import {Route} from '../route';

export type StateReader = (injector: Injector) => Promise<any>;

export interface RenderOperation<M, V> {
  templateDocument: string;
  moduleType: Type<M>;
  routes: Array<Route>;
  variants: Map<V, ComposedTransition>;
  stateReader?: StateReader;
}
