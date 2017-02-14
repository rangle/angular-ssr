import {Observable} from 'rxjs';

import {browserModuleToServerModule, instantiateApplicationModule} from 'platform';
import {RenderOperation, RenderVariantOperation} from '../operation';
import {Snapshot, takeSnapshot} from '../snapshot';
import {Route, routeToUri} from '../route';
import {fork} from './fork';

export const renderToStream = <M, V>(operation: RenderOperation<M, V>): Observable<Snapshot<V>> => {
  return Observable.create(publish => {
    const bind = (suboperation: RenderVariantOperation<M, V>) =>
      renderVariant(suboperation)
        .then(snapshot => {
          publish.next(snapshot);
        })
        .catch(exception => {
          publish.error(exception);
        });

    const promises = fork(operation).map(suboperation => bind(suboperation));

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

  return instantiateApplicationModule<M, Snapshot<V>>(
    moduleWrapper,
    templateDocument,
    absoluteUri,
    moduleRef => takeSnapshot(moduleRef, variant, stateReader));
};