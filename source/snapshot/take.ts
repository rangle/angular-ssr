import { composeBootstrap } from './compose';
import {
  ApplicationRef,
  Injector,
  NgModuleRef,
  ReflectiveInjector,
  Type,
} from '@angular/core';

import {Subscription, Observable} from 'rxjs';

import {SnapshotException} from '../exception';
import {Snapshot} from './snapshot';
import {ApplicationStateReader, ApplicationStateReaderFunction, Postprocessor, StateReader} from '../application/contracts';
import {RenderVariantOperation} from '../application/operation';
import {timeouts} from '../identifiers';

import {
  ConsoleCollector,
  DocumentContainer,
  ExceptionCollector,
  Reflector,
  waitForZoneToBecomeStable,
} from '../platform';

export const takeSnapshot = async <M, V>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<M, V>): Promise<Snapshot<V>> => {
  const {variant, uri, transition, scope: {stateReader, bootstrappers, postprocessors}} = vop;

  const snapshot: Partial<Snapshot<V>> = {variant, uri, exceptions: [], console: []};

  const contextSubscription = subscribeToContext(moduleRef, <Snapshot<any>> snapshot);

  try {
    const container = moduleRef.injector.get(DocumentContainer);

    // Mark the DOM as loaded and invoke remaining initialization tasks
    container.complete();

    const bootstrap = composeBootstrap(bootstrappers);

    await bootstrap(moduleRef.injector);

    if (transition != null) {
      transition(moduleRef.injector);
    }

    const applicationRef = moduleRef.injector.get(ApplicationRef);
    applicationRef.tick(); // transition above may have caused changes, force a tick

    await waitForZoneToBecomeStable(moduleRef, timeouts.application.bootstrap);

    let applicationState = undefined;

    if (stateReader) {
      applicationState = await stateReaderToFunction(stateReader)(moduleRef.injector);

      if (applicationState != null) {
        injectStateIntoDocument(container, applicationState);
      }
    }

    transformDocument(postprocessors, container.document);

    const renderedDocument = (<{outerHTML?}> container.document).outerHTML;

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

const stateReaderToFunction = (reader: ApplicationStateReader): ApplicationStateReaderFunction => {
  const type = reader as Type<StateReader>;

  const annotations = Reflector.annotations(type);
  if (annotations.length === 0) {
    return reader as ApplicationStateReaderFunction;
  }

  return instantiator(type);
};

const instantiator = (type: Type<StateReader>): ApplicationStateReaderFunction => {
  return (injector: Injector) => {
    const descendantInjector = ReflectiveInjector.resolveAndCreate([type], injector);
    const reader = descendantInjector.get(type);

    const applicationState = reader.getState();

    return applicationState instanceof Observable
      ? applicationState.toPromise()
      : Promise.resolve(applicationState);
  };
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

const transformDocument = (processors: Array<Postprocessor>, document: Document & {outerHTML?: string}) => {
  for (const processor of processors) {
    switch (processor.length) {
      case 1:
        processor(document);
        break;
      case 2:
        const result = processor(document, document.outerHTML);
        switch (typeof result) {
          case 'string':
            document.outerHTML = result as string;
            break;
          default:
            if (result != null) {
              throw new SnapshotException(`Invalid postprocessor result type: ${typeof result}`);
            }
            break;
        }
        break;
      default:
        throw new SnapshotException(`A postprocessor function must accept one or two arguments, not ${processor.length}`);
    }
  }
  return document;
};
