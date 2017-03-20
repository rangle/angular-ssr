import {Provider} from '@angular/core';

import {RuntimeModuleLoader} from './runtime-loader';

export const PLATFORM_MODULE_PROVIDERS: Array<Provider> = [
  {provide: RuntimeModuleLoader, useClass: RuntimeModuleLoader}
];