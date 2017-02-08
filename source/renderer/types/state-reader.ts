import {Injector} from '@angular/core';

export type StateReader = (injector: Injector) => Promise<any> | any;