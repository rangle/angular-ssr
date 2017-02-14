import {
  Component,
  NgModuleRef,
  NgModule,
  Type
} from '@angular/core';

import {Router} from '@angular/router';

import {
  browserModuleToServerModule,
  instantiateApplicationModule,
} from 'platform';

import {Reflector} from 'platform';
import {RouteException} from './exception';
import {Route} from './route';

export const renderableRoutes = async <M>(moduleType: Type<M>): Promise<Array<Route>> => {
  const moduleWrapper = browserModuleToServerModule(moduleType, () => {});

  const root = getBootstrapElement(moduleWrapper);

  const routes = await instantiateApplicationModule<M, Array<Route>>(
    moduleWrapper,
    `<html><body><${root}></${root}></html>`,
    'http://localhost',
    moduleRef => extractRoutes(moduleRef));

  return routes;
};

const extractRoutes = <M>(moduleRef: NgModuleRef<M>): Array<Route> => {
  const router: Router = moduleRef.injector.get(Router, null);
  if (router == null) {
    return [{path: []}]; // application does not use the router at all
  }

  throw new RouteException('Not implemented');
};

const getBootstrapElement = <M>(moduleType: Type<M>): string => {
  const modules = Reflector.decorators(moduleType, NgModule);

  const bootstrappable = modules.filter(m => m.bootstrap != null && m.bootstrap.length > 0);
  switch (bootstrappable.length) {
    case 0: throw new RouteException('Cannot find bootstrap element');
    case 1: break;
    default: throw new RouteException('More than one bootstrap element found');
  }

  const components = bootstrappable[0].bootstrap;
  switch (components.length) {
    case 0: throw new RouteException('bootstrap array is empty');
    case 1: break;
    default: throw new RouteException('More than one component in the bootstrap array is not supported');
  }

  const component = Reflector.decorators(<any> components[0], Component);
  if (component.length !== 1) {
    throw new RouteException('Cannot extract selector name from bootstrap element');
  }

  return component[0].selector;
};