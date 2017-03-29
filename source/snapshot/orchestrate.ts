import {ApplicationRef, NgModuleRef} from '@angular/core';

import {Subscription} from 'rxjs';

import {ConsoleLog} from './console';
import {ConsoleCollector, DocumentContainer, ExceptionCollector, waitForApplicationToBecomeStable} from '../platform';
import {RenderVariantOperation} from '../application/operation';
import {Snapshot} from './snapshot';
import {timeouts} from '../static';
import {executeBootstrap, injectState, transformDocument} from './creator';

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

    await waitForApplicationToBecomeStable(moduleRef, timeouts.application.bootstrap);

    tick(moduleRef);

    const applicationState = await injectState(moduleRef, stateReader, container.document)

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
