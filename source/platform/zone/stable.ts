import {NgModuleRef, NgZone} from '@angular/core';

import {Subscription} from 'rxjs';

export const waitForZoneToBecomeStable = async <M>(moduleRef: NgModuleRef<M>, timeout?: number): Promise<void> => {
  const zone: NgZone = moduleRef.injector.get(NgZone);

  return new Promise<void>(resolve => {
    setImmediate(() => {
      if (zone.isStable) {
        resolve();
      }
      else {
        let subscription: Subscription;

        const complete = () => {
          subscription.unsubscribe();
          resolve();
        };

        if (timeout) {
          subscription = zone.onStable.timeout(timeout).subscribe(
            () => complete(),
            exception => {
              console.warn(`Timed out while waiting for NgZone to become stable after ${timeout}ms! This is a serious performance problem!`);
              console.warn('This likely means that your application is stuck in an endless loop of change detection or some other pattern of misbehaviour');
              console.warn('In a normal application, a zone becomes stable very quickly');
              complete();
            });
        }
        else {
          subscription = zone.onStable.subscribe(() => complete());
        }
      }
    });
  });
};
