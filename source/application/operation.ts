import {Injector, NgModuleFactory, Type} from '@angular/core';

import {ComposedTransition} from '../variance';

import {Route} from '../route';

export interface StateReader {
  getState(): Promise<any>;
}

export type StateReaderFunction = (injector: Injector) => Promise<any>;

export type ApplicationStateReader = Type<StateReader> | StateReaderFunction;

export interface RenderOperation<M, V> {
  templateDocument: string;
  moduleFactory: NgModuleFactory<M>;
  routes: Array<Route>;
  variants: Map<V, ComposedTransition>;
  stateReader?: ApplicationStateReader;
  bootstrap: Array<(injector: Injector) => void>;
  postprocessors: Array<(html: string) => string>;
}

export interface RenderVariantOperation<M, V> {
  scope: RenderOperation<M, V>;
  route: Route;
  variant?: V;
  transition?: ComposedTransition;
}