import {ApplicationRef, NgModuleRef} from '@angular/core';

import chalk = require('chalk');

import {PendingRequests} from '../http';

import {Observable} from 'rxjs/Rx';

export const waitForApplicationToBecomeStable = async <M>(moduleRef: NgModuleRef<M>, timeout?: number): Promise<void> => {
  const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

  const requests: PendingRequests = moduleRef.injector.get(PendingRequests);

  return new Promise<void>(resolve => {
    let timer;
    if (timeout) {
      timer = setTimeout(() => {
        console.warn(chalk.yellow(`Timed out while waiting for NgZone to become stable after ${timeout}ms! This is a serious performance problem!`));
        console.warn(chalk.yellow('This likely means that your application is stuck in an endless loop of change detection or some other pattern of misbehaviour'));
        console.warn(chalk.yellow('In a normal application, a zone becomes stable very quickly'));
        resolve();
      },
      timeout);
    }

    const finish = () => {
      clearTimeout(timer);
      resolve();
    }

    const subscription = Observable.combineLatest(applicationRef.isStable, requests.requestsPending(),
        (appStable, pending) => appStable === true && pending === 0)
      .subscribe(v => {
        if (v) {
          finish();
          subscription.unsubscribe();
        }
      });
  });
};
