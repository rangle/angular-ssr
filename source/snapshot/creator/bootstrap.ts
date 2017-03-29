import {ApplicationRef, Injector, NgModuleRef} from '@angular/core';

import {
  ApplicationBootstrapper,
  ApplicationBootstrapperFunction,
  ComposedTransition
} from '../../application/contracts';

import {typeToInjectorFunction} from '../../transformation/type-to-function';

export const executeBootstrap = async <M>(moduleRef: NgModuleRef<M>, bootstrappers: Array<ApplicationBootstrapper>, transition: ComposedTransition) => {
  const bootstrap = composeBootstrap(bootstrappers);

  await bootstrap(moduleRef.injector);

  if (typeof transition === 'function') {
    transition(moduleRef.injector);
  }

  const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);

  applicationRef.tick(); // bootstrap or transition above may have caused changes, force a tick
};

export const composeBootstrap = (bootstrappers: Array<ApplicationBootstrapper>): ApplicationBootstrapperFunction => {
  if (bootstrappers == null || bootstrappers.length === 0) {
    return injector => {};
  }

  return (injector: Injector) => {
    const promises = bootstrappers.map(b => Promise.resolve(typeToInjectorFunction(b, instance => instance.bootstrap())(injector)));

    return Promise.all(promises) as Promise<any>
  }
};
