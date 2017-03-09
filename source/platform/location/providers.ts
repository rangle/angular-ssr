import {Provider} from '@angular/core';

import {PlatformLocation} from '@angular/common';

import {LocationImpl} from './location';

export const PLATFORM_LOCATION_PROVIDERS: Array<Provider> = [
  {provide: PlatformLocation, useClass: LocationImpl},
];