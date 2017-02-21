import {
  Injector,
  NgModuleRef,
  ReflectiveInjector,
  Type,
} from '@angular/core';

import {SnapshotException} from '../exception';

import {Snapshot} from './snapshot';

import {
  StateReaderFunction,
  ApplicationStateReader,
  RenderVariantOperation,
} from '../application/operation';

import {
  DocumentContainer,
  ExceptionStream,
  Reflector,
  stableZone,
} from '../platform';

export const takeSnapshot = async <M, V>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<M, V>): Promise<Snapshot<V>> => {
  const exceptions: ExceptionStream = moduleRef.injector.get(ExceptionStream);

  const {variant, route, transition} = vop;

  const snapshot: Partial<Snapshot<V>> = {variant, route, exceptions: new Array<Error>()};

  // The exception stream is a replay subject so even if exceptions were thrown prior to this
  // statement, we will still receive them through this subscription. It's important to be able
  // to tell the consumer about all exceptions that occurred while running the application.
  const subscription = exceptions.stream.subscribe(exception => snapshot.exceptions.push(exception));
  try {
    const container = moduleRef.injector.get(DocumentContainer);

    // Mark the DOM as loaded and invoke remaining initialization tasks
    container.complete();

    if (transition != null) {
      transition(moduleRef.injector);
    }

    await stableZone(moduleRef);

    const renderedDocument = container.document.outerHTML;

    const stateReader = conditionalInstantiate(vop.scope.stateReader);

    const applicationState = await stateReader(moduleRef.injector);

    return <Snapshot<V>> Object.assign(snapshot, {renderedDocument, applicationState});
  }
  finally {
    subscription.unsubscribe();
  }
}

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