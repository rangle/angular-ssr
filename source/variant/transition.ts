import {Type} from '@angular/core';

export interface StateTransition<T> {
  execute(value: T, ...dependencies: Array<Type<any>>): Promise<void> | void;
}