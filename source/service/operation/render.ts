import {Injector, Type} from '@angular/core';

import {ComposedTransition} from 'variance';

import {Route} from '../route';

export interface StateReader {
  getState(): Promise<any>;
}

export type StateReaderFunction = (injector: Injector) => Promise<any>;

export type ApplicationStateReader = Type<StateReader> | StateReaderFunction;

export interface RenderOperation<M, V> {
  templateDocument: string;
  moduleType: Type<M>;
  routes: Array<Route>;
  variants: Map<V, ComposedTransition>;
  stateReader?: ApplicationStateReader;
}

export interface RenderVariantOperation<M, V> {
  scope: RenderOperation<M, V>;
  route: Route;
  variant?: V;
  transition?: ComposedTransition;
}