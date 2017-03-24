import {
  APP_ID,
  COMPILER_OPTIONS,
  PlatformRef,
  Provider,
  createPlatformFactory,
} from '@angular/core';

import {
  COMPILER_PROVIDERS,
  platformCoreDynamic
} from '@angular/compiler';

import {PLATFORM_COLLECTOR_PROVIDERS} from './collectors';
import {PLATFORM_RESOURCE_LOADER_PROVIDERS} from './resource-loader';
import {PlatformImpl} from './platform';
import {CurrentZone} from './zone';
import {randomizedApplicationId} from '../identifiers';

export const createServerPlatform =
  createPlatformFactory(platformCoreDynamic, 'nodejs',
    new Array<Provider>(
      COMPILER_PROVIDERS,
      {
        provide: COMPILER_OPTIONS,
        useValue: {providers: [
          ...PLATFORM_RESOURCE_LOADER_PROVIDERS,
        ]},
        multi: true,
      },
      ...PLATFORM_COLLECTOR_PROVIDERS,
      {provide: APP_ID, useFactory: randomizedApplicationId},
      {provide: PlatformRef, useClass: PlatformImpl},
      {provide: CurrentZone, useClass: CurrentZone},
    ));
