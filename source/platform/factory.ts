import {
  COMPILER_OPTIONS,
  ErrorHandler,
  NgModule,
  PlatformRef,
  Provider,
  RootRenderer,
  Sanitizer,
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

import {DOCUMENT} from '@angular/platform-browser';

import {DomContext} from './dom';
import {ResourceLoaderImpl} from './resource-loader';
import {RootRendererImpl} from './render';
import {LocationImpl} from './location';
import {SanitizerImpl} from './sanitizer';
import {SharedStylesImpl} from './styles';

import {privateCoreImplementation} from 'platform';

const {
  APP_ID_RANDOM_PROVIDER,
} = privateCoreImplementation();

export const platformNode =
  createPlatformFactory(platformCoreDynamic, 'nodejs', [
    COMPILER_PROVIDERS,
    {
      provide: COMPILER_OPTIONS,
      useValue: {providers: [
        {provide: ResourceLoader, useClass: ResourceLoaderImpl}
      ]},
      multi: true,
    },
    APP_ID_RANDOM_PROVIDER,
    {provide: DomContext, useClass: DomContext},
    {provide: Sanitizer, useClass: SanitizerImpl},
    {provide: ErrorHandler, useFactory: () => new ErrorHandler(true)},
    {provide: RootRenderer, useClass: RootRendererImpl},
    {provide: PlatformLocation, useClass: LocationImpl}
  ]);