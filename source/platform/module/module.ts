import {
  APP_BOOTSTRAP_LISTENER,
  ApplicationModule,
  Component,
  ComponentRef,
  ModuleWithProviders,
  NgModule,
  Type,
} from '@angular/core';

import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';

import {Reflector} from './metadata';
import {PlatformException} from '../platform';
import {ComposedTransition} from 'variance';
import {flatten} from 'transformation';

type AdjustedModule<M> = {moduleType: Type<M>, bootstrap: Array<Type<any> | any>};

export const browserModuleToServerModule = <M>(baseModule: Type<M>, transition: ComposedTransition): Type<any> => {
  const {moduleType, bootstrap} = adjustModule(baseModule);

  const wrappedFunction = new Function('type', // unique name based on the real module name
    `return function Wrapped${baseModule.name}() {
        type.apply(this, arguments);
     }`);

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
  })(wrappedFunction(baseModule));
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

const cleanImports = (importedModules: Array<Array<any> | Type<any> | ModuleWithProviders>): Array<any> => {
  const imports = importedModules.slice();

  const browserIndex = imports.findIndex(token => token === BrowserModule);
  if (browserIndex >= 0) {
    imports.splice(browserIndex, 1);
  }

  return imports;
};

type InlinedComponents = {declarations: Array<Type<any>>, exports: Array<Type<any>>};

const inlineComponentsFromModule = (decorator: NgModule): InlinedComponents => {
  const replaced = new Map<Type<any>, Type<any>>();

  const declarations = flatten<Type<any>>(decorator.declarations || []).map(c => {
    const inlined = inlineComponent(c);
    if (inlined !== c) {
      replaced.set(c, inlined);
    }
    return inlined;
  });

  const exports = flatten<Type<any>>(decorator.exports || []).map(d => replaced.get(d) || d);

  return {declarations, exports};
};

const inlineComponent = (component: Type<any>): Type<any> => {
  const decorators = Reflector.decorators(component, Component);

  switch (decorators.length) {
    case 0: return component;
    case 1: break;
    default:
      throw new PlatformException(`Component ${component.name} has more than one @Component() decorator`);
  }

  const componentDecorator: Component = decorators[0];
  if (componentDecorator.templateUrl == null && // prior inline
      (componentDecorator.styleUrls == null ||
       componentDecorator.styleUrls.length === 0)) {
    return component;
  }

  const uris = [componentDecorator.templateUrl, ...(componentDecorator.styleUrls || [])].filter(v => v);

  if (componentDecorator.moduleId == null && uris.some(u => u.startsWith('/') === false)) {
    throw new PlatformException(`${component.name} uses relative URL path(s) without moduleId: either set moduleId or use the webpack template loader to inline these resources`);
  }

  return component;
};

const recursiveCollect = <D>(fromModule: Type<any>, decoratorType: Type<D>, selector: (decorator: D) => Array<any>) => {
  const decorators = Reflector.decorators(fromModule, decoratorType);

  let select = [];

  for (const decorator of decorators) {
    select = [
      ...select,
      ...(selector(decorator) || new Array<any>()),
      ...(select.map(s => recursiveCollect(s, decoratorType, selector))),
    ];
  }

  return select;
};