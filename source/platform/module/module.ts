import {
  APP_BOOTSTRAP_LISTENER,
  ComponentRef,
  NgModule,
  NgModuleDecorator,
  Type
} from '@angular/core';

import {CommonModule} from '@angular/common';

import {BootstrapException} from './exception';

import {Reflector, MutateDecorator} from './metadata';

import {
  ComposedTransition,
  RenderVariantOperation
} from '../../renderer';

export const browserModuleToServerModule = <M, V>(vop: RenderVariantOperation<M, V>): Type<any> => {
  const moduleType = adjustModule(vop.scope.moduleType);

  return wrap(moduleType, vop.transition);
};

const adjustModule = <M>(moduleType: Type<M>) => {
  const mutator: MutateDecorator<NgModuleDecorator> = decorator => {
    return decorator;
  };

  Reflector.mutateAnnotation(moduleType, NgModule, mutator);

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
      CommonModule,
      moduleType,
    ],
    providers: [
      {provide: APP_BOOTSTRAP_LISTENER, useValue: bootstrap, multi: true},
    ]
  })
  class WrappedModule {}

  return WrappedModule;
}