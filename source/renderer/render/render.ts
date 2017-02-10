import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {
  Route,
  RouteException,
} from '../route';

import {
  acquirePlatform,
  browserModuleToServerModule,
} from '../../platform';

import {Snapshot, snapshot} from '../snapshot';

import {
  RenderOperation,
  RenderVariantOperation,
} from './operation';

export const render = <M, V>(operation: RenderOperation<M, V>): Observable<Snapshot<V>> => {
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

const run = async <M, V>(operation: RenderVariantOperation<M, V>): Promise<string> => {
  const platform = acquirePlatform();
  try {
    const wrapper = browserModuleToServerModule(operation);

    const moduleRef = await platform.bootstrapModule<M>(wrapper);
    try {
      return await snapshot<M, V>(moduleRef, operation);
    }
    finally {
      moduleRef.destroy();
    }
  }
  finally {
    platform.destroy();
  }
};
