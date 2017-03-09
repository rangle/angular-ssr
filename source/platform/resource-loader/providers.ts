import {Provider} from '@angular/core/index';

import {ResourceLoader} from '@angular/compiler/index';

import {ResourceLoaderImpl} from './loader';

export const PLATFORM_RESOURCE_LOADER_PROVIDERS: Array<Provider> = [
  {provide: ResourceLoader, useClass: ResourceLoaderImpl}
];