import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {VariantWithTransformer} from '../variant';

import {
  RenderOperation,
  RenderDocument,
  RenderRoute,
} from './types';

import {acquirePlatform} from '../platform';

import {moduleWrap} from './module';
import {navigateRoute} from './navigate';
import {snapshot} from './snapshot';

export const render = <M, V>(operation: RenderOperation<M, V>): Observable<RenderDocument<V>> => {
  return Observable.create(publish => {
    const promises = new Array<Promise<void>>();

    for (const route of operation.routes) {
      for (const variant of operation.variants) {
        const promise = this.renderVariant(operation, route, variant)
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

const renderVariant = async <M, V>(operation: RenderOperation<M, V>, route: RenderRoute, vt: VariantWithTransformer<V>): Promise<RenderDocument<V>> => {
  const {variant} = vt;

  const platform = acquirePlatform();
  try {
    const moduleWrapper = moduleWrap(operation.moduleType, route, vt);

    const moduleRef = await platform.bootstrapModule(moduleWrapper);
    try {
      await navigateRoute(moduleRef, route);

      const document = await snapshot<M>(moduleRef);

      return {variant, document};
    }
    finally {
      moduleRef.destroy();
    }
  }
  catch (exception) {
    return {variant, exception};
  }
  finally {
    platform.destroy();
  }
};