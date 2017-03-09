import {NgModuleRef, NgZone} from '@angular/core';

export const waitForZoneToBecomeStable = async <M>(moduleRef: NgModuleRef<M>): Promise<void> => {
  const zone: NgZone = moduleRef.injector.get(NgZone);

  const unstable = () => zone.hasPendingMacrotasks || zone.hasPendingMicrotasks;

  if (unstable()) {
    return new Promise<void>(resolve => {
      const subscription = zone.onMicrotaskEmpty.subscribe(() => {
        if (unstable() === false) {
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  }
  return Promise.resolve(void 0);
};
