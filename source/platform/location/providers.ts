import {Provider} from '@angular/core';

import {LOCATION_INITIALIZED, PlatformLocation} from '@angular/common';

import {LocationImpl} from './location';

export const PLATFORM_LOCATION_PROVIDERS: Array<Provider> = [
  {provide: PlatformLocation, useClass: LocationImpl},
  {
    provide: LOCATION_INITIALIZED,
    useFactory: (location: LocationImpl) => location.initializationPromise,
    deps: [PlatformLocation]
  },
];