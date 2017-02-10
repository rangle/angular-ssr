import 'reflect-metadata';

import {Type} from '@angular/core';

import {ReflectionException} from './exception';

import {privateCoreImplementation} from '../../imports';

const {reflector} = privateCoreImplementation();

export type MutateDecorator<T extends ClassDecorator> = (decorator: T) => T;

export abstract class Reflector {
  static annotations<T>(type: Type<T>): Array<any> {
    return reflector.annotations(type);
  }

  static annotate<T>(type: Type<T>, annotations: Array<any>) {
    Reflect.defineMetadata('annotations', annotations, type);
  }

  static mutateAnnotation<T, D extends ClassDecorator>(type: Type<T>, decoratorType: D, mutator: MutateDecorator<D>): void {
    const annotations = Reflector.annotations<T>(type);

    const index = annotations.findIndex(d => d instanceof decoratorType);
    if (index < 0) {
      throw new ReflectionException(`Decorator type not found: ${decoratorType.name}`);
    }

    const mutated = mutator(annotations[index]);

    const annotationsCloned = annotations.slice();
    annotationsCloned.splice(index, 1, mutated);

    Reflector.annotate(type, annotationsCloned);
  }

  static cloneWithDecorators<T>(type: Type<T>): Type<T> {
    const wrappedFunction = new Function('type',
      `return function ${type.name}() {
         type.apply(this, arguments);
       }`);

    const ctor = wrappedFunction(type);

    ctor.prototype = type.prototype;

    Reflector.annotate(ctor, Reflector.annotations(type));

    return ctor;
  }
}
