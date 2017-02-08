import {
  Injector,
  Type,
} from '@angular/core';

export interface StateTransitionContract<T> {
  execute(value: T): Promise<void> | void;
}

export type StateTransition<T> = (injector: Injector, value: T) => Promise<void> | void;
