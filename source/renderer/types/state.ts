import {Injector} from '@angular/core';

export type StateExtractor = (injector: Injector) => Promise<any> | any;