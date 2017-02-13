import {
  COMPILER_OPTIONS,
  NgModule,
  PlatformRef,
  Provider,
  RootRenderer,
  createPlatformFactory,
} from '@angular/core';

import {
  PlatformLocation
} from '@angular/common';

import {
  COMPILER_PROVIDERS,
  ResourceLoader,
  platformCoreDynamic
} from '@angular/compiler';

import {ResourceLoaderImpl} from './resource-loader';
import {RootRendererImpl} from './render';
import {LocationImpl} from './location';

export const platformNode =
  createPlatformFactory(platformCoreDynamic, 'nodejs', [
    COMPILER_PROVIDERS,
    {
      provide: COMPILER_OPTIONS,
      useValue: {providers: [
        {provide: ResourceLoader, useClass: ResourceLoaderImpl}
      ]},
      multi: true
    },
    {provide: RootRenderer, useClass: RootRendererImpl},
    {provide: PlatformLocation, useClass: LocationImpl}
  ]);