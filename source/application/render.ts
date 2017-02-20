import {Observable, Subject} from 'rxjs';

import {bootstrapModuleFactory, forkZone} from 'platform';
import {RenderOperation, RenderVariantOperation} from './operation';
import {Snapshot, takeSnapshot} from 'snapshot';
import {routeToUri} from 'route';
import {fork} from './fork';

export const renderToStream = <M, V>(operation: RenderOperation<M, V>): Observable<Snapshot<V>> => {
  const subject = new Subject<Snapshot<V>>();

  const bind = async (suboperation: RenderVariantOperation<M, V>) => {
    try {
      subject.next(await renderVariant(suboperation));
    }
    catch (exception) {
      subject.error(exception);
    }
  };

  const promises = fork(operation).map(suboperation => bind(suboperation));

  Promise.all(promises).then(() => subject.complete());

  return subject.asObservable();
};

const renderVariant = async <M, V>(operation: RenderVariantOperation<M, V>): Promise<Snapshot<V>> => {
  const {
    route,
    scope: {
      templateDocument,
      moduleFactory,
    }
  } = operation;

  const absoluteUri = routeToUri(route);

  return forkZone(templateDocument, absoluteUri, () =>
    bootstrapModuleFactory<M, Snapshot<V>>(
      moduleFactory,
      moduleRef => takeSnapshot(moduleRef, operation)));
};
