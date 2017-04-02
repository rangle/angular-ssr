import {ApplicationRef, NgModuleRef} from '@angular/core';

import {Subscription} from 'rxjs';

import {ConsoleLog} from './console';
import {ConsoleCollector, DocumentContainer, ExceptionCollector, waitForApplicationToBecomeStable, waitForRouterNavigation} from '../platform';
import {RenderVariantOperation} from '../application/operation';
import {Snapshot} from './snapshot';
import {timeouts} from '../static';
import {executeBootstrap, injectPreboot, injectState, transformDocument} from './creator';

export const snapshot = async <M, V>(moduleRef: NgModuleRef<M>, vop: RenderVariantOperation<V>): Promise<Snapshot<V>> => {
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

    await waitForRouterNavigation(moduleRef);

    // We have to tick once to kick off the init lifecycle events of the app.
    // The likelihood is that these lifecycle events will themselves cause
    // new asynchronous operations to start, for example HTTP requests. So
    // we wait for those to finish, then we tick once more, to update the
    // UI with any results that we may have received. If an application does
    // not make requests on startup then there will be no wait time for the
    // app to become stable, so there is no performance loss.
    tick(moduleRef);

    await waitForApplicationToBecomeStable(moduleRef, timeouts.application.bootstrap);

    tick(moduleRef);

    const applicationState = await injectState(moduleRef, stateReader, container.document)

    injectPreboot(moduleRef, vop);

    transformDocument(postprocessors, container.document);

    const renderedDocument = (<{outerHTML?}> container.document).outerHTML;

    return <Snapshot<V>> Object.assign(snapshot, {renderedDocument, applicationState});
  }
  finally {
    contextSubscription.unsubscribe();
  }
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

const tick = <M>(moduleRef: NgModuleRef<M>) => moduleRef.injector.get(ApplicationRef).tick();
