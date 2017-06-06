import {ApplicationRef, NgModuleRef} from '@angular/core';

import chalk = require('chalk');

import {PendingRequests} from '../http';

import {Observable} from 'rxjs/Rx';

export const waitForApplicationToBecomeStable = async <M>(moduleRef: NgModuleRef<M>, timeout?: number): Promise<void> => {
  const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

  const requests: PendingRequests = moduleRef.injector.get(PendingRequests);

  return new Promise<void>(resolve => {
    let timer;

    if (typeof timeout === 'number' && timeout > 0) {
      timer = setTimeout(() => {
        console.warn(chalk.yellow(`Timed out while waiting for NgZone to become stable after ${timeout}ms! This is a serious performance problem!`));
        console.warn(chalk.yellow('This likely means that your application is stuck in an endless loop of change detection or some other pattern of misbehaviour'));
        console.warn(chalk.yellow('In a normal application, a zone becomes stable very quickly'));
        console.warn('Proceeding with render operation even though the zone is not stable: this is a very dangerous thing to do!')
        console.warn('You can adjust the zone-becomes-stable timeout with ApplicationBuilder::stabilizeTimeout(), or zero to disable');
        resolve();
      },
      timeout);
    }

    const combined = Observable.combineLatest(applicationRef.isStable, requests.requestsPending(),
      (appStable, pending) => {
        return appStable && pending === 0;
      });

    const subscription = combined.subscribe(v => {
      if (v === true) {
        if (subscription) {
          subscription.unsubscribe();
        }
        if (timer != null) {
          clearTimeout(timer);
        }
        resolve();
      }
    });
  });
};
