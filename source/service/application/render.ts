import {Observable} from 'rxjs';

import {browserModuleToServerModule, instantiateApplicationModule} from 'platform';
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
    variant,
    route,
    scope: {
      templateDocument,
      moduleType,
      stateReader
    }
  } = operation;

  const absoluteUri = routeToUri(route);

  const moduleWrapper = browserModuleToServerModule(moduleType, transition);

  return await instantiateApplicationModule<M, Snapshot<V>>(
    moduleWrapper,
    templateDocument,
    absoluteUri,
    async (moduleRef) => await takeSnapshot(moduleRef, variant, stateReader));
};
