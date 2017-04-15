import 'reflect-metadata';

import {Type} from '@angular/core';

export abstract class Reflector {
  static annotations<T>(type: Type<T>): Array<any> {
    return Reflect.getMetadata('annotations', type);
  }
}
