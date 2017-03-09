import {Provider} from '@angular/core';

import {ResourceLoader} from '@angular/compiler';

import {ResourceLoaderImpl} from './loader';

export const PLATFORM_RESOURCE_LOADER_PROVIDERS: Array<Provider> = [
  {provide: ResourceLoader, useClass: ResourceLoaderImpl}
];