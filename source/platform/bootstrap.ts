import {
  ApplicationInitStatus,
  ApplicationRef,
  ErrorHandler,
  NgModuleRef,
  NgZone
} from '@angular/core';

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

    return applicationInit.donePromise.then(() => {
      const applicationRef = moduleRef.injector.get(ApplicationRef);

      const {bootstrapFactories, instance: {ngDoBootstrap}} = <any> moduleRef;

      if (bootstrapFactories.length > 0) {
        for (const component of bootstrapFactories) {
          applicationRef.bootstrap(component);
        }
      }
      else if (typeof ngDoBootstrap === 'function') {
        ngDoBootstrap.bind(moduleRef.instance)(applicationRef);
      }
      else {
        throw new PlatformException(`Module declares neither bootstrap nor ngDoBootstrap: ${description}`);
      }
    });
  });
};