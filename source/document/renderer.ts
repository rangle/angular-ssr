import {Injectable, Type} from '@angular/core';

import {Observable} from 'rxjs';

import {Permutations} from '../variant/permutations';

import {RenderedDocument} from './document';

export class DocumentRenderer<V, M> {
  constructor(
    private moduleType: Type<M>,
    private permutations: Permutations<V, M>
  ) {}

  render(): Observable<RenderedDocument<V>> {
    throw new Error('Not implemented');
  }
}