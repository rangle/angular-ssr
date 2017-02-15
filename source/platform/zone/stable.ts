import {NgModuleRef, NgZone} from '@angular/core';

// What we are waiting for is both the micro and macro task queues to become empty.
// What this means is that all change detection routines have finished, all micro
// tasks have finished, and all macro tasks (eg HTTP requests) have finished. If all
// of these conditions are true, the zone is said to be stable. This allows us with
// some degree of confidence to say that an application is ready to be inspected,
// because no more tasks are happening or queued in the background.

export const stableZone = async <M>(moduleRef: NgModuleRef<M>): Promise<void> => {
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
