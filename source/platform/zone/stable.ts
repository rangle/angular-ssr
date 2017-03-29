import {ApplicationRef, NgModuleRef, NgZone} from '@angular/core';
import chalk = require('chalk');

import {PendingRequests} from '../http/pending-requests';

import {Observable} from 'rxjs/Rx';

export const waitForApplicationToBecomeStable = async <M>(moduleRef: NgModuleRef<M>, timeout?: number): Promise<void> => {
  const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

  const ngZone: NgZone = moduleRef.injector.get(NgZone);

  const requests: PendingRequests = moduleRef.injector.get(PendingRequests);

  return new Promise<void>(resolve => {
    const observable: Observable<boolean> = Observable.from(applicationRef.isStable);

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

    observable.combineLatest(requests.requestsPending,
        (appStable, pending) => (appStable === true || ngZone.isStable === true) && pending === 0)
      .takeWhile(v => v === true)
      .take(1)
      .subscribe(finish);
  });
};
