import {
  APP_ID,
  COMPILER_OPTIONS,
  PlatformRef,
  Provider,
  createPlatformFactory,
  platformCore,
} from '@angular/core';

import {
  COMPILER_PROVIDERS,
  platformCoreDynamic
} from '@angular/compiler';

import {PLATFORM_COLLECTOR_PROVIDERS} from './collectors';
import {PLATFORM_RESOURCE_LOADER_PROVIDERS} from './resource-loader';
import {PlatformImpl} from './platform';
import {ZoneProperties} from './zone';
import {randomizedApplicationId} from '../static';

const baseProviders = [
  ...PLATFORM_COLLECTOR_PROVIDERS,
  {provide: APP_ID, useFactory: randomizedApplicationId},
  {provide: PlatformRef, useClass: PlatformImpl},
  {provide: ZoneProperties, useClass: ZoneProperties},
];

export const createJitPlatform =
  createPlatformFactory(platformCoreDynamic, 'jit',
    new Array<Provider>(
      COMPILER_PROVIDERS,
      {
        provide: COMPILER_OPTIONS,
        useValue: {providers: [
          ...PLATFORM_RESOURCE_LOADER_PROVIDERS,
        ]},
        multi: true,
      },
      ...baseProviders,
    ));

export const createStaticPlatform = createPlatformFactory(platformCore, 'static', baseProviders);