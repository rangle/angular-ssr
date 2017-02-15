import {
  APP_BOOTSTRAP_LISTENER,
  ApplicationModule,
  ComponentRef,
  NgModule,
  Type,
} from '@angular/core';

import {CommonModule} from '@angular/common';

import {Reflector} from './metadata';
import {cleanImports, inlineComponentsFromModule, recursiveCollect} from './mutate';
import {ComposedTransition} from 'variance';

type AdjustedModule<M> = {moduleType: Type<M>, bootstrap: Array<Type<any> | any>};

export const browserModuleToServerModule = <M>(baseModule: Type<M>, transition: ComposedTransition): Type<any> => {
  const {moduleType, bootstrap} = adjustModule(baseModule);

  return NgModule({
    imports: [
      moduleType,
    ],
    providers: [
      {
        provide: APP_BOOTSTRAP_LISTENER,
        useValue:
          transition
            ? <T>(componentRef: ComponentRef<T>) => transition(componentRef.injector)
            : () => {},
        multi: true,
      },
    ],
    bootstrap,
  })(baseModule);
};

const adjustModule = <M>(baseType: Type<M>): AdjustedModule<M> => {
  let bootstrap: Array<Type<any> | any>;

  const moduleType = Reflector.cloneWithDecorators(baseType);

  Reflector.mutateAnnotation(moduleType, NgModule,
    decorator => {
      const imports = cleanImports(decorator.imports || []);

      imports.push(ApplicationModule);
      imports.push(CommonModule);

      bootstrap = decorator.bootstrap;

      const {declarations, exports} = inlineComponentsFromModule(decorator);

      return {imports, bootstrap: [], exports, declarations};
    });

  const modules = recursiveCollect<NgModule>(moduleType, NgModule, m => m.imports);

  for (const m of modules) {
    Reflector.mutateAnnotation(m, NgModule,
      decorator => {
        const imports = cleanImports(decorator.imports || []);

        const {declarations, exports} = inlineComponentsFromModule(decorator);

        return {imports, declarations, exports};
      });
  }

  return {moduleType, bootstrap};
};
