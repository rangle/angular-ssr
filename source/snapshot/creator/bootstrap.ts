import {Injector, NgModuleRef} from '@angular/core';

import {
  ApplicationBootstrapper,
  ApplicationBootstrapperFunction,
  ComposedTransition
} from '../../application/contracts';

import {typeToInjectorFunction} from '../../transformation/type-to-function';

import {none} from '../../predicate';

export const executeBootstrap = async <M>(moduleRef: NgModuleRef<M>, bootstrappers: Array<ApplicationBootstrapper>, transition: ComposedTransition) => {
  const bootstrap = composeBootstrap(bootstrappers);

  await bootstrap(moduleRef.injector);

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
