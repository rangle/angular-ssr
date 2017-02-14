import {
  COMPILER_OPTIONS,
  ErrorHandler,
  RootRenderer,
  Sanitizer,
  PlatformRef,
  Provider,
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

import {DocumentContainer} from './document';
import {ResourceLoaderImpl} from './resource-loader';
import {RootRendererImpl} from './render';
import {LocationImpl} from './location';
import {SanitizerImpl} from './sanitizer';
import {DomSharedStyles, SharedStyles} from './styles';

import {privateCoreImplementation} from 'platform';

const {
  APP_ID_RANDOM_PROVIDER,
} = privateCoreImplementation();

export type PlatformFactory = (extraProviders?: Array<Provider>) => PlatformRef;

export const platformNode: PlatformFactory =
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
    {provide: DocumentContainer, useClass: DocumentContainer},
    {provide: DomSharedStyles, useClass: DomSharedStyles},
    {provide: SharedStyles, useClass: SharedStyles},
    {provide: Sanitizer, useClass: SanitizerImpl},
    {provide: ErrorHandler, useFactory: () => new ErrorHandler(true)},
    {provide: RootRenderer, useClass: RootRendererImpl},
    {provide: PlatformLocation, useClass: LocationImpl}
  ]);