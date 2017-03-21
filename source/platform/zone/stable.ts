import {NgModuleRef, NgZone} from '@angular/core';

export const waitForZoneToBecomeStable = async <M>(moduleRef: NgModuleRef<M>): Promise<void> => {
  const zone: NgZone = moduleRef.injector.get(NgZone);

  return new Promise<void>(resolve => {
    process.nextTick(() => {
      if (zone.isStable) {
        resolve();
      }
      else {
        const subscription = zone.onStable.subscribe(() => {
          subscription.unsubscribe();
          resolve();
        });
      }
    });
  });
};
