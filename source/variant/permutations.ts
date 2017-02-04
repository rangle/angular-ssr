import {NgModuleRef} from '@angular/core';

import {Variant} from './variant';

export type Transformer<M> = (moduleRef: NgModuleRef<M>) => Promise<void>;

export type VariantMap = {[name: string]: Variant<any>};

export interface Pair<V, M> {
  variant: V;
  execute: Transformer<M>;
}

export class Permutations<V, M> {
  private pairs: Array<Pair<V, M>>;

  constructor(variants: VariantMap) {
    this.pairs = this.compute(variants);
  }

  public get variants(): Array<Pair<V, M>> {
    return this.pairs;
  }

  private compute(variants: VariantMap): Array<Pair<V, M>> {
    throw new Error('Not implemented');
  }
}