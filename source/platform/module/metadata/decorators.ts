import {Type} from '@angular/core';

import {Reflector} from './reflector';

import {Decorators} from '../../../static';

const annotations = <T>(type: Type<T>): Array<any> => Reflector.annotations(type) || [];

export const isInjectable = <T>(type: Type<T>): boolean => annotations(type).some(a => a.toString() === Decorators.injectable);
