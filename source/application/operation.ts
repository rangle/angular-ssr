import {Injector, NgModuleFactory, Type} from '@angular/core';

import {ComposedTransition, VariantsMap} from '../variants';

import {Route} from '../route';

export interface StateReader {
  getState(): Promise<any>;
}

export type StateReaderFunction = (injector: Injector) => Promise<any>;

export type ApplicationStateReader = Type<StateReader> | StateReaderFunction;

export interface RenderOperation<M> {
  templateDocument: string;
  moduleFactory: NgModuleFactory<M>;
  routes: Array<Route>;
  variants: VariantsMap;
  stateReader?: ApplicationStateReader;
  bootstrap: Array<(injector: Injector) => void>;
  postprocessors: Array<(html: string) => string>;
}

export interface RenderVariantOperation<M, V> {
  scope: RenderOperation<M>;
  uri: string;
  variant?: V;
  transition?: ComposedTransition;
}