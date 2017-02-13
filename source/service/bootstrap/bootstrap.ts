import {Observable} from 'rxjs';

import {
  Route,
  RouteException,
  Snapshot,
  snapshot,
} from 'renderer';

import {
  RenderOperation,
  RenderVariantOperation,
} from '../operation';

import {run} from './run';

export const bootstrap = <M, V>(operation: RenderOperation<M, V>): Observable<Snapshot<V>> => {
  return Observable.create(publish => {
    const operations = new Array<RenderVariantOperation<M, V>>();

    for (const route of operation.routes) {
      for (const [variance, transition] of Array.from(operation.variance.entries())) {
        const suboperation: RenderVariantOperation<M, V> = {
          scope: operation,
          route,
          variance,
          transition,
        };

        operations.push(suboperation);
      }
    }

    const promises = operations.map(
      suboperation =>
        run(suboperation)
          .then(document => {
            publish.next({variant: suboperation.variance, document});
          })
          .catch(exception => {
            publish.next({variant: suboperation.variance, exception});
          }));

    Promise.all(promises).then(() => publish.complete());
  });
};
