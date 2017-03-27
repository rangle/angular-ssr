import {ApplicationRef, Injector, NgModuleRef} from '@angular/core';

import {Subscription} from 'rxjs';

import {ApplicationBootstrapperFunction, ApplicationBootstrapper, ApplicationStateReader, ComposedTransition, Postprocessor} from '../application/contracts';
import {typeToInjectorFunction} from '../transformation';
import {ConsoleLog} from './console';
import {ConsoleCollector, DocumentContainer, ExceptionCollector, waitForApplicationToBecomeStable} from '../platform';
import {RenderVariantOperation} from '../application/operation';
import {SnapshotException} from '../exception';
import {Snapshot} from './snapshot';
import {timeouts} from '../static';

export const snapshot = async <M, V>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<M, V>): Promise<Snapshot<V>> => {
  const {variant, uri, transition, scope: {stateReader, bootstrappers, postprocessors}} = vop;

  const snapshot: Snapshot<V> = {
    console: new Array<ConsoleLog>(),
    exceptions: new Array<Error>(),
    renderedDocument: undefined,
    uri,
    variant,
  };

  const contextSubscription = subscribeToContext(moduleRef, snapshot);
  try {
    const container = moduleRef.injector.get(DocumentContainer);

    container.complete();

    await executeBootstrap(moduleRef, bootstrappers, transition);

    await waitForApplicationToBecomeStable(moduleRef, timeouts.application.bootstrap);

    const applicationState = await injectState(moduleRef, stateReader, container.document)

    transformDocument(postprocessors, container.document);

    const renderedDocument = (<{outerHTML?}> container.document).outerHTML;

    return <Snapshot<V>> Object.assign(snapshot, {renderedDocument, applicationState});
  }
  finally {
    contextSubscription.unsubscribe();
  }
};

const executeBootstrap = async <M>(moduleRef: NgModuleRef<M>, bootstrappers: Array<ApplicationBootstrapper>, transition: ComposedTransition) => {
  const bootstrap = composeBootstrap(bootstrappers);

  await bootstrap(moduleRef.injector);

  if (typeof transition === 'function') {
    transition(moduleRef.injector);
  }

  const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

  applicationRef.tick(); // bootstrap or transition above may have caused changes, force a tick
};

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

const injectState = async <M>(moduleRef: NgModuleRef<M>, stateReader: ApplicationStateReader<any>, document: Document) => {
  let applicationState = undefined;

  if (stateReader) {
    const injectorfn = typeToInjectorFunction(stateReader, r => Promise.resolve(r.getState()));

    applicationState = await injectorfn(moduleRef.injector);

    if (applicationState != null) {
      injectStateIntoDocument(document, applicationState);
    }
  }

  return applicationState;
}

const injectStateIntoDocument = (document: Document, applicationState): void => {
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
  for (const processor of processors || []) {
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

const composeBootstrap = (bootstrappers: Array<ApplicationBootstrapper>): ApplicationBootstrapperFunction => {
  if (bootstrappers == null || bootstrappers.length === 0) {
    return injector => {};
  }

  return (injector: Injector) => {
    const promises = bootstrappers.map(b => Promise.resolve(typeToInjectorFunction(b, instance => instance.bootstrap())(injector)));

    return Promise.all(promises) as Promise<any>
  }
};
