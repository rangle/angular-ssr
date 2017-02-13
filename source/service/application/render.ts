import {Observable} from 'rxjs';

import {
  RenderOperation,
  RenderVariantOperation,
} from '../operation';

import {
  Snapshot,
  takeSnapshot,
} from '../snapshot';

import {fork} from './fork';

import {
  createPlatform,
  browserModuleToServerModule,
} from 'platform';

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
};

const renderVariant = async <M, V>(operation: RenderVariantOperation<M, V>): Promise<Snapshot<V>> => {
  const platform = createPlatform();

  try {
    const {transition, scope: {moduleType}} = operation;

    const wrapper = browserModuleToServerModule(moduleType, transition);

    const moduleRef = await platform.bootstrapModule<M>(wrapper);

    try {
      return await takeSnapshot(moduleRef, operation.variant);
    }
    finally {
      moduleRef.destroy();
    }
  }
  finally {
    platform.destroy();
  }
};