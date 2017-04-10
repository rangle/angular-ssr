import {Type} from '@angular/core';

const {ɵreflector: reflector} = require('@angular/core');

export abstract class Reflector {
  static annotations<T>(type: Type<T>): Array<any> {
    return reflector.annotations(type);
  }
}
