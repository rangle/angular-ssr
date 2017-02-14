import {Observable} from 'rxjs';

import {browserModuleToServerModule, bootstrapApplicationWithExecute, forkZone} from 'platform';
import {RenderOperation, RenderVariantOperation} from '../operation';
import {Snapshot, takeSnapshot} from '../snapshot';
import {routeToUri} from '../route';
import {fork} from './fork';

export const renderToStream = <M, V>(operation: RenderOperation<M, V>): Observable<Snapshot<V>> => {
  return Observable.create(publish => {
    const bind = async (suboperation: RenderVariantOperation<M, V>) => {
      try {
        publish.next(await renderVariant(suboperation));
      }
      catch (exception) {
        publish.error(exception);
      }
    };

    const promises = fork(operation).map(async (suboperation) => await bind(suboperation));

    Promise.all(promises).then(() => publish.complete());
  });
};

const renderVariant = async <M, V>(operation: RenderVariantOperation<M, V>): Promise<Snapshot<V>> => {
  const {
    transition,
    route,
    scope: {
      templateDocument,
      moduleType,
    }
  } = operation;

  const absoluteUri = routeToUri(route);

  const moduleWrapper = browserModuleToServerModule(moduleType, transition);

  return forkZone(templateDocument, absoluteUri,
    async () =>
      await bootstrapApplicationWithExecute<M, Snapshot<V>>(
        moduleWrapper,
        async (moduleRef) => await takeSnapshot(moduleRef, operation)));
};
