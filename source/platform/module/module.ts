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

import {Reflector} from './metadata';
import {ComposedTransition} from '../../variance';
import {privateCoreImplementation} from '../imports';

type AdjustedModule<M> = {moduleType: Type<M>, bootstrap: Array<Type<any> | any>};

export const browserModuleToServerModule = <M, V>(baseModule: Type<M>, transition: ComposedTransition): Type<any> => {
  const {moduleType, bootstrap} = adjustModule(baseModule);

  const boot =
    transition
      ? <T>(componentRef: ComponentRef<T>) => transition(componentRef.injector)
      : () => {};

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
};

const adjustModule = <M>(baseType: Type<M>): AdjustedModule<M> => {
  let bootstrap: Array<Type<any> | any>;

  const moduleType = Reflector.cloneWithDecorators(baseType);

  Reflector.mutateAnnotation(moduleType, NgModule,
    decorator => {
      const imports = (decorator.imports || []).slice();

      const browserIndex = imports.findIndex(token => token === BrowserModule);
      if (browserIndex >= 0) {
        imports.splice(browserIndex, 1);
      }

      imports.push(ApplicationModule);
      imports.push(CommonModule);

      bootstrap = decorator.bootstrap;

      return {imports, bootstrap: [], providers: decorator.providers, exports: (decorator.exports||[]).concat(decorator.declarations)};
    });

  return {moduleType, bootstrap};
};
