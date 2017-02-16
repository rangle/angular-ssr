import 'reflect-metadata';

import {Type} from '@angular/core';

import {privateCoreImplementation} from '../../imports';

import {Clone} from 'transformation';

const {reflector} = privateCoreImplementation();

export type MutateDecorator<T> = (decorator: T) => Partial<T>;

export abstract class Reflector {
  static annotations<T>(type: Type<T>): Array<any> {
    return reflector.annotations(type);
  }

  static annotate<T>(type: Type<T>, annotations: Array<any>) {
    Reflect.defineMetadata('annotations', annotations, type);
  }

  static decorators<T, D>(type: Type<T>, decoratorType: Type<D>): Array<D> {
    const annotations = Reflector.annotations<T>(type);

    return annotations.filter(a => a instanceof decoratorType);
  }

  static parameters<T>(type: Type<T>): Array<Type<any>> {
    return reflector.parameters(type);
  }

  static decorated<T, D>(type: Type<T>, decoratorType: Type<D>): boolean {
    return Reflector.decorators<T, D>(type, decoratorType).length > 0;
  }

  static mutateAnnotation<T, D>(type: Type<T>, decoratorType: Type<D>, mutator: MutateDecorator<D>): void {
    const annotations = Reflector.annotations<T>(type).slice();

    const splices = new Array<[number, D]>();

    for (let i = 0; i < annotations.length; ++i) {
      const decorator = annotations[i];
      if (decorator instanceof decoratorType) {
        splices.push([i, Clone.facade(annotations[i], mutator(annotations[i]))]);
      }
    }

    for (const [index, mutated] of splices) {
      annotations.splice(index, 1, mutated);
    }

    Reflector.annotate<T>(type, annotations);
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
