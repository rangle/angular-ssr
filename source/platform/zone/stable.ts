import {NgModuleRef, NgZone} from '@angular/core';

export const waitForZoneToBecomeStable = async <M>(moduleRef: NgModuleRef<M>): Promise<void> => {
  const zone: NgZone = moduleRef.injector.get(NgZone);

  const unstable = () => zone.hasPendingMacrotasks || zone.hasPendingMicrotasks;

  return new Promise<void>(resolve => {
    process.nextTick(() => {
      if (unstable() === false) {
        resolve();
      }
      else {
        const subscription = zone.onMicrotaskEmpty.subscribe(() => {
          if (unstable() === false) {
            subscription.unsubscribe();
            resolve();
          }
        });
      }
    });
  });
};
