import {
  APP_BOOTSTRAP_LISTENER,
  ApplicationModule,
  ComponentRef,
  ModuleWithProviders,
  NgModule,
  Provider,
  Type
} from '@angular/core';

import {CommonModule} from '@angular/common';

import {BrowserModule} from '@angular/platform-browser';

import {BootstrapException} from './exception';
import {Reflector, MutateDecorator} from './metadata';
import {ComposedTransition} from '../../variance';
import {privateCoreImplementation} from '../imports';

type AdjustedModule<M> = {moduleType: Type<M>, bootstrap: Array<Type<any> | any>};

export const browserModuleToServerModule =
    <M, V>(moduleType: Type<M>, transition: ComposedTransition): Type<any> => {
  const {moduleType: adjustedModule, bootstrap} = adjustModule(moduleType);

  return wrap(adjustedModule, bootstrap, transition);
};

const adjustModule = <M>(moduleType: Type<M>): AdjustedModule<M> => {
  let bootstrap: Array<Type<any> | any>;

  const mutator: MutateDecorator<NgModule> = decorator => {
    const imports = (decorator.imports || []).slice();

    const browserIndex = imports.findIndex(token => token === BrowserModule);
    if (browserIndex >= 0) {
      imports.splice(browserIndex, 1);
    }

    imports.push(ApplicationModule);
    imports.push(CommonModule);

    bootstrap = decorator.bootstrap;

    return {imports, bootstrap: []};
  };

  Reflector.mutateAnnotation(moduleType, NgModule, mutator);

  return {moduleType, bootstrap};
};

const wrap = <M>(moduleType: Type<M>, bootstrap: Array<Type<any> | any>, transition: ComposedTransition) => {
  const boot = <T>(componentRef: ComponentRef<T>) => {
    if (typeof transition === 'function') {
      try {
        transition(componentRef.injector);
      }
      catch (exception) {
        throw new BootstrapException('Failed to run variant transitions', exception);
      }
    }
  };

  @NgModule({
    imports: [
      moduleType,
    ],
    providers: [
      {provide: APP_BOOTSTRAP_LISTENER, useValue: boot, multi: true},
    ],
    bootstrap,
  })
  class WrappedModule {}

  return WrappedModule;
}