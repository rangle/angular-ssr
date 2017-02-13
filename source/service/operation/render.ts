import {Injector, Type} from '@angular/core';

import {ComposedTransition, Route} from 'renderer';

export type StateReader = (injector: Injector) => Promise<any>;

export interface RenderOperation<M, V> {
  templateDocument: string;
  moduleType: Type<M>;
  routes: Array<Route>;
  variance: Map<V, ComposedTransition>;
  stateReader?: StateReader;
}
