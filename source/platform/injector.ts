import {
  Injector,
  NgZone,
  ReflectiveInjector,
} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';

import {PLATFORM_COLLECTOR_PROVIDERS} from './collectors';
import {PLATFORM_DOCUMENT_PROVIDERS} from './document';
import {PLATFORM_HTTP_PROVIDERS} from './http';
import {PLATFORM_LOCATION_PROVIDERS} from './location';
import {PLATFORM_RENDERER_PROVIDERS} from './render';
import {PLATFORM_STYLE_PROVIDERS} from './styles';

export const createPlatformInjector = (root: Injector, ngZone: NgZone): Injector => {
  const providers = [
    ...PLATFORM_COLLECTOR_PROVIDERS,
    ...PLATFORM_DOCUMENT_PROVIDERS,
    ...PLATFORM_HTTP_PROVIDERS,
    ...PLATFORM_LOCATION_PROVIDERS,
    ...PLATFORM_RENDERER_PROVIDERS,
    ...PLATFORM_STYLE_PROVIDERS,
    {provide: BrowserModule, useValue: null},
    {provide: NgZone, useValue: ngZone},
  ];

  return ReflectiveInjector.resolveAndCreate(providers, root);
};
