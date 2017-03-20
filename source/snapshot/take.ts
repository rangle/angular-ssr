import {
  Injector,
  NgModuleRef,
  ReflectiveInjector,
  Type,
} from '@angular/core';

import {Subscription} from 'rxjs';

import {SnapshotException} from '../exception';

import {Snapshot} from './snapshot';

import {
  StateReaderFunction,
  ApplicationStateReader,
  RenderVariantOperation,
} from '../application/operation';

import {
  ConsoleCollector,
  DocumentContainer,
  ExceptionCollector,
  Reflector,
  waitForZoneToBecomeStable,
} from '../platform';

export const takeSnapshot = async <M, V>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<M, V>): Promise<Snapshot<V>> => {
  const {variant, route, transition, scope: {bootstrap, postprocessors}} = vop;

  const snapshot: Partial<Snapshot<V>> = {variant, route, exceptions: [], console: []};

  const contextSubscription = subscribeToContext(moduleRef, <Snapshot<any>> snapshot);

  try {
    const container = moduleRef.injector.get(DocumentContainer);

    // Mark the DOM as loaded and invoke remaining initialization tasks
    container.complete();

    for (const fn of bootstrap || []) {
      fn(moduleRef.injector);
    }

    if (transition != null) {
      transition(moduleRef.injector);
    }

    await waitForZoneToBecomeStable(moduleRef);

    const stateReader = conditionalInstantiate(vop.scope.stateReader);

    const applicationState = await stateReader(moduleRef.injector);

    if (applicationState != null) {
      injectStateIntoDocument(container, applicationState);
    }

    const renderedDocument = transformDocument(postprocessors || [], (<any>container.document).outerHTML);

    return <Snapshot<V>> Object.assign(snapshot, {renderedDocument, applicationState});
  }
  finally {
    contextSubscription.unsubscribe();
  }
}

const subscribeToContext = <M>(moduleRef: NgModuleRef<M>, snapshot: Snapshot<any>): {unsubscribe: () => void} => {
  const exceptions: ExceptionCollector = moduleRef.injector.get(ExceptionCollector);

  const log: ConsoleCollector = moduleRef.injector.get(ConsoleCollector);

  const subscriptions = new Array<Subscription>();

  subscriptions.push(exceptions.observable().subscribe(exception => snapshot.exceptions.push(exception)));

  subscriptions.push(log.observable().subscribe(consolelog => snapshot.console.push(consolelog)));

  return {
    unsubscribe: () => {
      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    }
  }
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

const injectStateIntoDocument = (container: DocumentContainer, applicationState): void => {
  const {document} = container;

  if (document.head == null) {
    const headElement = document.createElement('head');

    document.appendChild(headElement);
  }

  const script = document.createElement('script');

  script.setAttribute('type', 'text/javascript');

  try {
    script.textContent = `window.bootstrapApplicationState = ${JSON.stringify(applicationState)};`;
  }
  catch (exception) {
    throw new SnapshotException(`Application state must be a plain serializable JavaScript object, but serialization failed: ${exception}`);
  }

  document.head.appendChild(script);
};

const transformDocument = (processors: Array<(html: string) => string>, document: string): string => {
  for (const processor of processors) {
    document = processor(document);
  }
  return document;
};