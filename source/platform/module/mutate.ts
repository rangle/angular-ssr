import {
  Component,
  Type,
  ModuleWithProviders,
  NgModule
} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';

import {Reflector} from './metadata';

import {PlatformException} from '../exception';

import {flatten} from 'transformation';

export const cleanImports = (importedModules: Array<Array<any> | Type<any> | ModuleWithProviders>): Array<any> => {
  const imports = importedModules.slice();

  const browserIndex = imports.findIndex(token => token === BrowserModule);
  if (browserIndex >= 0) {
    imports.splice(browserIndex, 1);
  }

  return imports;
};

const mutateComponent = (component: Type<any>): Type<any> => {
  const decorators = Reflector.decorators(component, Component);

  // TODO(cbond): This does not actually inline the templates of the component yet.
  // It just spits out an exception if your module uses relative paths with no module
  // ID set (which would generate a ResourceLoader exception later anyway). I haven't
  // figured out a way to automatically inline the templates of components yet. FIXME

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

  const uris = [componentDecorator.templateUrl].concat(componentDecorator.styleUrls);

  if (componentDecorator.moduleId == null) {
    if (uris.filter(v => v).some(u => u.startsWith('/') === false)) {
      throw new PlatformException(`${component.name} uses relative templateUrl or styleUrls that cannot be resolved without moduleId`);
    }
  }

  return component;
};

type InlinedComponents = {declarations: Array<Type<any>>, exports: Array<Type<any>>};

export const inlineComponentsFromModule = (decorator: NgModule): InlinedComponents => {
  const replaced = new Map<Type<any>, Type<any>>();

  const declarations = flatten<Type<any>>(decorator.declarations || []).map(c => {
    const inlined = mutateComponent(c);
    if (inlined !== c) {
      replaced.set(c, inlined);
    }
    return inlined;
  });

  const exports = flatten<Type<any>>(decorator.exports || []).map(d => replaced.get(d) || d);

  return {declarations, exports};
};

export const recursiveCollect = <D>(fromModule: Type<any>, decoratorType: Type<D>, selector: (decorator: D) => Array<any>) => {
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