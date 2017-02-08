import {
  APP_BOOTSTRAP_LISTENER,
  ComponentRef,
  NgModule,
  Type
} from '@angular/core';

import {RenderRoute, routeToUri} from './types';

import {RequestUri} from './tokens';

import {VariantWithTransformer} from '../variant';

export const moduleWrap = <M, V>(moduleType: Type<M>, route: RenderRoute, variant?: VariantWithTransformer<V>): Type<any> => {
  const bootstrap = <T>(componentRef: ComponentRef<T>) => variant.transition(componentRef.injector);

  @NgModule({
    imports: [
      moduleType,
    ],
    providers: [
      {provide: RequestUri, useValue: routeToUri(route)},
      {provide: APP_BOOTSTRAP_LISTENER, useValue: bootstrap, multi: true},
    ]
  })
  class WrappedModule {}

  return WrappedModule;
};