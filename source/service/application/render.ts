import {Observable} from 'rxjs';

import {instantiateApplicationModule} from 'platform';
import {RenderOperation, RenderVariantOperation} from '../operation';
import {Snapshot, takeSnapshot} from '../snapshot';
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
  const {transition, variant, scope: {moduleType, stateReader}} = operation;

  return instantiateApplicationModule<M, Snapshot<V>>(
    moduleType,
    transition,
    moduleRef => takeSnapshot(moduleRef, variant, stateReader));
};