import {ApplicationRef, NgModuleRef} from '@angular/core';

import {PendingRequests} from '../http/pending-requests';

import {Observable} from 'rxjs/Rx';

export const waitForApplicationToBecomeStable = async <M>(moduleRef: NgModuleRef<M>, timeout?: number): Promise<void> => {
  const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

  const requests: PendingRequests = moduleRef.injector.get(PendingRequests);

  return new Promise<void>(resolve => {
    const observable: Observable<boolean> = Observable.from(applicationRef.isStable);

    observable.combineLatest(requests.requestsPending, (stable, pending) => stable === true && pending === 0)
      .takeWhile(v => v === true)
      .take(1)
      .timeout(timeout)
      .subscribe(
        () => {
          resolve();
        },
        exception => {
          console.warn(`Timed out while waiting for NgZone to become stable after ${timeout}ms! This is a serious performance problem!`);
          console.warn('This likely means that your application is stuck in an endless loop of change detection or some other pattern of misbehaviour');
          console.warn('In a normal application, a zone becomes stable very quickly');
          resolve();
        });
  });
};