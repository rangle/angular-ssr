import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {
  RenderOperation,
  RenderDocument,
} from './types';

import {renderVariant} from './render-variant';

export const render = <M, V>(operation: RenderOperation<M, V>): Observable<RenderDocument<V>> => {
  return Observable.create(publish => {
    const promises = new Array<Promise<void>>();

    const combined = operation.routes.map(r => operation.variants.map(v => [r, v]));

    for (const [route, variant] of combined) {
      const promise = this.renderVariant(operation, route, variant)
        .then(document => {
          publish.next(document);
        });

      promises.push(promise);
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