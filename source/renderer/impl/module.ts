import {
  APP_BOOTSTRAP_LISTENER,
  ComponentRef,
  NgModule,
  Type
} from '@angular/core';

import {
  BootstrapException,
  RenderVariantOperation,
  ComposedTransition,
} from '../types';

export const browserModuleToServerModule = <M, V>(vop: RenderVariantOperation<M, V>): Type<any> => {
  const moduleType = adjustModule(vop.scope.moduleType);

  return wrap(moduleType, vop.transition);
};

const adjustModule = <M>(moduleType: Type<M>) => {
  return moduleType;
};

const wrap = <M>(moduleType: Type<M>, transition: ComposedTransition) => {
  const bootstrap = <T>(componentRef: ComponentRef<T>) => {
    if (typeof transition === 'function') {
      try {
        transition(componentRef.injector);
      }
      catch (exception) {
        throw new BootstrapException('Failed to run variance transitions', exception);
      }
    }
  };

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
}