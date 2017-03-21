import {Injector} from '@angular/core';

export interface StateTransition<T> {
  execute(value: T): Promise<void> | void;
}

export type StateTransitionFunction<T> = (injector: Injector, value: T) => Promise<void> | void;

export type ComposedTransition = (injector: Injector) => void;
