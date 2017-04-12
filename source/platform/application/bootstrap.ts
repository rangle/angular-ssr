import {
  ApplicationInitStatus,
  ApplicationRef,
  ErrorHandler,
  Injector,
  NgModuleRef,
  NgZone
} from '@angular/core';

import {PlatformLocation} from '@angular/common';

import {
  ApplicationBootstrapper,
  ApplicationBootstrapperFunction,
  ComposedTransition
} from '../../application/contracts';

import {LocationImpl} from '../location';
import {PlatformException} from '../../exception';
import {none} from '../../predicate';
import {typeToInjectorFunction} from '../../transformation/type-to-function';

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

export const executeBootstrap = async <M>(moduleRef: NgModuleRef<M>, bootstrappers: Array<ApplicationBootstrapper>, transition: ComposedTransition) => {
  const bootstrap = composeBootstrap(bootstrappers);

  await Promise.resolve(bootstrap(moduleRef.injector));

  if (typeof transition === 'function') {
    await Promise.resolve(transition(moduleRef.injector));
  }
};

export const composeBootstrap = (bootstrappers: Array<ApplicationBootstrapper>): ApplicationBootstrapperFunction => {
  if (none(bootstrappers)) {
    return injector => {};
  }

  return (injector: Injector) => {
    const promises = bootstrappers.map(b => Promise.resolve(typeToInjectorFunction(b, instance => instance.bootstrap())(injector)));

    return Promise.all(promises) as Promise<any>
  }
};
