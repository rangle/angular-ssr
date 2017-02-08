import {
  APP_BOOTSTRAP_LISTENER,
  ComponentRef,
  NgModule,
  Type
} from '@angular/core';

import {
  RenderRoute,
  renderRouteToUri
} from './render-route';

import {RequestUri} from './tokens';

import {VariantWithTransformer} from '../variant';

export const wrapModule = <M, V>(moduleType: Type<M>, route: RenderRoute, variant?: VariantWithTransformer<V>): Type<any> => {
  const bootstrap = <T>(componentRef: ComponentRef<T>) =>
    Promise.resolve(
      variant
        ? variant.transition(componentRef.injector)
        : void 0);

  @NgModule({
    imports: [
      moduleType,
    ],
    providers: [
      {provide: RequestUri, useValue: renderRouteToUri(route)},
      {provide: APP_BOOTSTRAP_LISTENER, useValue: bootstrap, multi: true},
    ]
  })
  class WrappedModule {}

  return WrappedModule;
};