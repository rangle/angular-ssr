import {
  ApplicationInitStatus,
  ApplicationRef,
  ErrorHandler,
  NgModuleRef,
  NgZone
} from '@angular/core';

import {PlatformLocation} from '@angular/common';

import {LocationImpl} from './location';

import {PlatformException} from '../exception';

export const bootstrapModule = <M>(zone: NgZone, moduleRef: NgModuleRef<M>): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const exceptionHandler: ErrorHandler = moduleRef.injector.get(ErrorHandler);

    zone.onError.subscribe(
      exception => {
        exceptionHandler.handleError(exception);
        reject(exception);
      });

    const description = moduleRef.instance.constructor.name;

    const applicationInit = moduleRef.injector.get(ApplicationInitStatus, null);
    if (applicationInit == null) {
      throw new PlatformException(`Your application module ${description} does not import ApplicationModule, but it must`);
    }

    const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

    const {bootstrapFactories, instance: {ngDoBootstrap}} = <any> moduleRef;

    const location = moduleRef.injector.get(PlatformLocation) as LocationImpl;

    location.initializationComplete();

    applicationInit.donePromise.then(() => {
      if (bootstrapFactories.length > 0) {
        for (const component of bootstrapFactories) {
          applicationRef.bootstrap(component);
        }
        resolve();
      }
      else if (typeof ngDoBootstrap === 'function') {
        const bootstrapResult = ngDoBootstrap.bind(moduleRef.instance)(applicationRef);

        Promise.resolve(bootstrapResult).then(() => resolve()).catch(exception => reject(exception));
      }
      else {
        reject(new PlatformException(`Module declares neither bootstrap nor ngDoBootstrap: ${description}`));
      }
    })
    .catch(exception => reject(exception));
  });
};