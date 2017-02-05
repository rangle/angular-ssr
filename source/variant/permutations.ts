import {
  NgModuleRef,
  Type
} from '@angular/core';

import {Variant} from './variant';
import {StateTransition} from './transition';

export type Transformer = <M>(moduleRef: NgModuleRef<M>) => Promise<void>;

export interface VariantWithTransformer<V> {
  variant: V;
  transform: Transformer;
}

export const permutations =
    <V>(...variants: Array<Variant<any>>): Array<VariantWithTransformer<V>> => {
  throw new Error('Not implemented');
}

const combineTransitions =
    (pairs: Array<[Type<StateTransition<any>>, any]>): Transformer => {
  throw new Error('Not implemented');
}