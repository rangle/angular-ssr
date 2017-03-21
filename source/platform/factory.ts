import {
  APP_ID,
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

const generateRandomIdentifier = () => {
  const character = () => Math.random().toString(36).slice(2)[0];

  return `${character()}${character()}${character()}`;
};

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
      {provide: APP_ID, useFactory: generateRandomIdentifier},
      ...PLATFORM_COLLECTOR_PROVIDERS,
      {provide: PlatformRef, useClass: PlatformImpl},
      {provide: Sanitizer, useClass: SanitizerImpl},
      {provide: CurrentZone, useClass: CurrentZone},
    ));
