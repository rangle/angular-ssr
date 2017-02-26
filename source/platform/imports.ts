import {__core_private__ as privates} from '@angular/core/index';

if (privates == null) {
  throw new Error('Cannot locate private core exports in @angular/core');
}

export const privateCoreImplementation = () => <any> privates;