import {Injector, ReflectiveInjector, Type} from '@angular/core';

import {Reflector} from '../platform/module/metadata';

import {
  ApplicationBootstrapper,
  ApplicationBootstrapperFunction,
  Bootstrap
} from '../application/contracts'

export const composeBootstrap = (bootstrappers: Array<ApplicationBootstrapper>): ApplicationBootstrapperFunction => {
  if (bootstrappers == null || bootstrappers.length === 0) {
    return injector => {};
  }
  return (injector: Injector) => <Promise<any>> Promise.all(bootstrappers.map(b => bootstrapToFunction(injector, b)));
};

const bootstrapToFunction = (injector: Injector, bootstrap: ApplicationBootstrapper): ApplicationBootstrapperFunction => {
  const type = bootstrap as Type<Bootstrap>;

  const annotations = Reflector.annotations(type); // injectable?
  if (annotations.length > 0) {
    return instantiator(type);
  }
  return bootstrap as ApplicationBootstrapperFunction;
};

const instantiator = (type: Type<Bootstrap>): ApplicationBootstrapperFunction => {
  return (injector: Injector) => {
    const descendantInjector = ReflectiveInjector.resolveAndCreate([type], injector);
    const transition = descendantInjector.get(type);
    return Promise.resolve(transition.execute());
  };
};
