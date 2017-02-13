import {Observable} from 'rxjs';

import {
  RenderOperation,
  RenderVariantOperation,
} from '../operation';

import {Snapshot} from '../snapshot';

import {fork} from './fork';

import {renderVariant} from './render-variant';

export const renderToStream = <M, V>(operation: RenderOperation<M, V>): Observable<Snapshot<V>> => {
  return Observable.create(publish => {
    const operations = fork(operation);

    const bind = (suboperation: RenderVariantOperation<M, V>) =>
      renderVariant(suboperation)
        .then(document => {
          publish.next({variant: suboperation.variant, document});
        })
        .catch(exception => {
          publish.next({variant: suboperation.variant, exception});
        });

    const promises = operations.map(suboperation => bind(suboperation));

    Promise.all(promises).then(() => publish.complete());
  });
}
