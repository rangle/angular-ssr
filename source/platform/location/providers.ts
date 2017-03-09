import {Provider} from '@angular/core/index';

import {PlatformLocation} from '@angular/common/index';

import {LocationImpl} from './location';

export const PLATFORM_LOCATION_PROVIDERS: Array<Provider> = [
  {provide: PlatformLocation, useClass: LocationImpl},
];