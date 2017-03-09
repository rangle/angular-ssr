import {
  COMPILER_OPTIONS,
  Sanitizer,
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
import {SanitizerImpl} from './sanitizer';
import {CurrentZone} from './zone';

import {privateCoreImplementation} from '../platform';

const {
  APP_ID_RANDOM_PROVIDER,
} = privateCoreImplementation();

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
      APP_ID_RANDOM_PROVIDER,
      ...PLATFORM_COLLECTOR_PROVIDERS,
      {provide: PlatformRef, useClass: PlatformImpl},
      {provide: Sanitizer, useClass: SanitizerImpl},
      {provide: CurrentZone, useClass: CurrentZone},
    ));
