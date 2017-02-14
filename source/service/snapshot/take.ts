import {
  Injector,
  NgModuleRef,
  NgZone,
  ReflectiveInjector,
  Type,
} from '@angular/core';

import {SnapshotException} from './exception';
import {Snapshot} from './snapshot';

import {
  StateReaderFunction,
  ApplicationStateReader,
} from '../operation';

import {DocumentContainer, Reflector} from 'platform';

export const takeSnapshot =
    async <M, V>(moduleRef: NgModuleRef<M>, variant: V, asr?: ApplicationStateReader): Promise<Snapshot<V>> => {
  await waitUntilStable(moduleRef);

  const container = moduleRef.injector.get(DocumentContainer);

  const renderedDocument = container.document.outerHTML;

  const stateReader = conditionalInstantiate(asr);

  const applicationState = await stateReader(moduleRef.injector);

  return <Snapshot<V>> {
    renderedDocument,
    variant,
    applicationState,
  };
}

const waitUntilStable = async <M>(moduleRef: NgModuleRef<M>): Promise<void> => {
  const zone: NgZone = moduleRef.injector.get(NgZone);

  if (zone.hasPendingMacrotasks || zone.hasPendingMicrotasks) {
    return new Promise<void>(resolve => {
      const subscription = zone.onMicrotaskEmpty.subscribe(() => {
        // What we are waiting for is both the micro and macro task queues to become
        // empty, then we can take a snapshot of the idle page. But as long as there
        // are tasks going on in the background, we must wait for the application to
        // enter an idle state.
        if (zone.isStable === true) {
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  }
  return Promise.resolve(void 0);
};

// An application state reader can be either an injectable class or a function
const conditionalInstantiate = (reader: ApplicationStateReader): StateReaderFunction => {
  if (reader == null) {
    return injector => Promise.resolve(undefined);
  }

  if (typeof reader !== 'function') {
    throw new SnapshotException(`A state reader must either be an injectable class or a function, not a ${typeof reader}`);
  }

  const type = <Type<any>> reader;

  const annotations = Reflector.annotations(type); // injectable?
  if (annotations.length > 0) {
    return (injector: Injector) => {
      const childInjector = ReflectiveInjector.resolveAndCreate([type], injector);

      const reader = childInjector.get(type);

      return reader.getState();
    };
  }

  return <StateReaderFunction> reader;
};