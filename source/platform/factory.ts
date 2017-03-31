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
import {ServerPlatform} from './platform';
import {ZoneProperties} from './zone';
import {randomizedApplicationId} from '../static';

const baseProviders: Array<Provider> = [
  ...PLATFORM_COLLECTOR_PROVIDERS,
  {provide: APP_ID, useFactory: randomizedApplicationId},
  {provide: PlatformRef, useClass: ServerPlatform},
  {provide: ZoneProperties, useClass: ZoneProperties},
];

export const createStaticPlatform = createPlatformFactory(platformCore, 'node/static', baseProviders);

const jitProviders: Array<Provider> = [
  COMPILER_PROVIDERS,
  {
    provide: COMPILER_OPTIONS,
    useValue: {providers: [
      ...PLATFORM_RESOURCE_LOADER_PROVIDERS,
    ]},
    multi: true,
  },
  ...baseProviders,
];

export const createJitPlatform = createPlatformFactory(platformCoreDynamic, 'node/jit', jitProviders);
