import {ErrorHandler, Provider} from '@angular/core/index';

import {ConsoleCollector} from './console';

import {ExceptionCollector} from './exceptions';

import {privateCoreImplementation} from './../imports';

const {Console} = privateCoreImplementation();

export const PLATFORM_COLLECTOR_PROVIDERS: Array<Provider> = [
  {provide: ConsoleCollector, useClass: ConsoleCollector},
  {provide: Console, useExisting: ConsoleCollector},
  {provide: ExceptionCollector, useClass: ExceptionCollector},
  {provide: ErrorHandler, useExisting: ExceptionCollector}
];