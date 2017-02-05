import {
  NgModuleRef,
  Type,
} from '@angular/core';

export interface StateTransitionContract<T> {
  execute(value: T): Promise<void> | void;
}

export type StateTransition<T> =
  <M>(moduleRef: NgModuleRef<M>, value: T) => Promise<void> | void;
