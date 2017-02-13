import {
  PlatformRef,
  Provider,
  createPlatformFactory,
  platformCore
} from '@angular/core';

export type PlatformFactory = (extraProviders?: Provider[]) => PlatformRef;

export const createPlatform: PlatformFactory =
  createPlatformFactory(platformCore, 'server', []);