import {Injector, ReflectiveInjector, Type} from '@angular/core';

import {Reflector} from '../platform/module/metadata';

import {injectable} from '../static';

export type InjectorFunction<R> = (injector: Injector, ...args) => R;

export const typeToInjectorFunction = <T, R>(classOrFunction: Type<T> | InjectorFunction<R>, execute: (instance: T) => R): InjectorFunction<R> => {
  try {
    const type: Type<T> = classOrFunction as Type<T>;

    const annotations = Reflector.annotations(type);
    if (decoratedWithInjectable(annotations) === false) {
      return <InjectorFunction<R>> classOrFunction;
    }

    return instantiator<T, R>(type, execute);
  }
  catch (exception) {
    return <InjectorFunction<R>> classOrFunction;
  }
};

const decoratedWithInjectable = (annotations: Array<any>): boolean => {
  if (annotations == null || annotations.length === 0) {
    return false;
  }
  return annotations.some(a => a.toString() === injectable);
};

const instantiator = <T, R>(type: Type<T>, execute: (instance: T) => R): (injector: Injector) => R => {
  return (injector: Injector) => {
    const descendantInjector = ReflectiveInjector.resolveAndCreate([type], injector);

    const reader = descendantInjector.get(type);

    return execute(reader);
  };
};
