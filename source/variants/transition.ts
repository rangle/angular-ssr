import {Injector} from '@angular/core';

export type ComposedTransition = (injector: Injector) => void;

export interface StateTransitionContract<T> {
  execute(value: T): Promise<void> | void;
}

export type StateTransition<T> = (injector: Injector, value: T) => Promise<void> | void;
