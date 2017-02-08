import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {
  RenderOperation,
  RenderVariantOperation,
  RenderDocument,
} from './types';

import {bootstrap} from './bootstrap';

export const render = <M, V>(operation: RenderOperation<M, V>): Observable<RenderDocument<V>> => {
  return Observable.create(publish => {
    const promises = new Array<Promise<void>>();

    for (const route of operation.routes) {
      for (const transform of operation.variants) {
        const childOperation: RenderVariantOperation<M, V> = {parentOperation: operation, route, transform};

        const promise = bootstrap(childOperation)
          .then(document => {
            publish.next(document);
          });

        promises.push(promise);
      }
    }

    Promise.all(promises)
      .then(() => {
        publish.complete();
      })
      .catch(exception => {
        publish.error(new Error(`Catastrophic rendering exception: ${exception.stack}`));
      })
  });
};