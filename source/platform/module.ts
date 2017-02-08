import 'reflect-metadata';

import {
  ApplicationModule,
  ErrorHandler,
  NgModule,
  RootRenderer
} from '@angular/core';

import {
  CommonModule,
  PlatformLocation,
} from '@angular/common';

import {PlatformLocationImpl} from './location';

import {RootRendererImpl} from './render';

@NgModule({
  imports: [
    CommonModule,
    ApplicationModule
  ],
  exports: [
    CommonModule,
    ApplicationModule
  ],
  providers: [
    {provide: ErrorHandler, useExisting: ErrorHandler},
    {provide: RootRenderer, useClass: RootRendererImpl},
    {provide: PlatformLocation, useClass: PlatformLocationImpl}
  ]
})
export class ServerModule {}