import {
  APP_BOOTSTRAP_LISTENER,
  ComponentRef,
  NgModule,
  Type
} from '@angular/core';

import {RenderVariantOperation, routeToUri} from './types';

import {RequestUri} from './tokens';

export const moduleWrap = <M, V>(operation: RenderVariantOperation<M, V>): Type<any> => {
  const bootstrap = <T>(componentRef: ComponentRef<T>) => {
    if (operation.transform) {
      operation.transform.transition(componentRef.injector);
    }
  };

  @NgModule({
    imports: [
      operation.parentOperation.moduleType,
    ],
    providers: [
      {provide: RequestUri, useValue: routeToUri(operation.route)},
      {provide: APP_BOOTSTRAP_LISTENER, useValue: bootstrap, multi: true},
    ]
  })
  class WrappedModule {}

  return WrappedModule;
};