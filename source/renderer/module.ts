import {
  APP_BOOTSTRAP_LISTENER,
  ComponentRef,
  NgModule,
  Type
} from '@angular/core';

import {RenderVariantOperation} from './types';

export const browserModuleToServerModule = <M, V>(operation: RenderVariantOperation<M, V>): Type<any> => {
  const bootstrap = <T>(componentRef: ComponentRef<T>) => {
    if (operation.transform) {
      operation.transform.transition(componentRef.injector);
    }
  };

  const moduleType = adjustModule(operation.scope.moduleType);

  @NgModule({
    imports: [
      moduleType,
    ],
    providers: [
      {provide: APP_BOOTSTRAP_LISTENER, useValue: bootstrap, multi: true},
    ]
  })
  class WrappedModule {}

  return WrappedModule;
};

export const adjustModule = <M>(moduleType: Type<M>) => {
  return moduleType;
};