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
  RenderVariantOperation,
} from '../operation';

import {
  DocumentContainer,
  ExceptionStream,
  Reflector,
} from 'platform';

export const takeSnapshot = async <M, V>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<M, V>): Promise<Snapshot<V>> => {
  const exceptions: ExceptionStream = moduleRef.injector.get(ExceptionStream);

  const {variant, route} = vop;

  const snapshot: Partial<Snapshot<V>> = {variant, route, exceptions: new Array<Error>()};

  // The exception stream is a replay subject so even if exceptions were thrown prior to this
  // statement, we will still receive them through this subscription. It's important to be able
  // to tell the consumer about all exceptions that occurred while running the application.
  const subscription = exceptions.stream.subscribe(exception => snapshot.exceptions.push(exception));
  try {
    const container = moduleRef.injector.get(DocumentContainer);

    // Mark the DOM as loaded and invoke remaining initialization tasks
    container.complete();

    // Wait until the application enters a stable (idle) state
    await waitUntilStable(moduleRef);

    const renderedDocument = container.document.outerHTML;

    const stateReader = conditionalInstantiate(vop.scope.stateReader);

    const applicationState = await stateReader(moduleRef.injector);

    return <Snapshot<V>> Object.assign(snapshot, {renderedDocument, applicationState});
  }
  finally {
    subscription.unsubscribe();
  }
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
  else if (typeof reader !== 'function') {
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