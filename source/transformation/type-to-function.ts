import {Injector, ReflectiveInjector, Type} from '@angular/core';

import {isInjectable} from '../platform/module/metadata/decorators';

export type InjectorFunction<R> = (injector: Injector, ...args) => R;

export const typeToInjectorFunction = <T, R>(classOrFunction: Type<T> | InjectorFunction<R>, execute: (instance: T) => R): InjectorFunction<R> => {
  try {
    if (isInjectable(classOrFunction as Type<T>) === false) {
      return <InjectorFunction<R>> classOrFunction;
    }
    else {
      return instantiator<T, R>(classOrFunction as Type<T>, execute);
    }
  }
  catch (exception) {
    return <InjectorFunction<R>> classOrFunction;
  }
};

const instantiator = <T, R>(type: Type<T>, execute: (instance: T) => R): (injector: Injector) => R => {
  return (injector: Injector) => {
    const descendantInjector = ReflectiveInjector.resolveAndCreate([type], injector);

    const reader = descendantInjector.get(type);

    return execute(reader);
  };
};
