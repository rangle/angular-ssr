import {NgModuleRef, Type} from '@angular/core';

import {Router} from '@angular/router';

import {instantiateApplicationModule} from 'platform';

import {RouteException} from './exception';
import {Route} from './route';

export const renderableRoutes = async <M>(moduleType: Type<M>): Promise<Array<Route>> => {
  const routes = await instantiateApplicationModule<M, Array<Route>>(
    moduleType,
    null,
    moduleRef => extractRoutes(moduleRef));

  return routes;
};

const extractRoutes = <M>(moduleRef: NgModuleRef<M>): Array<Route> => {
  const router: Router = moduleRef.injector.get(Router);
  if (router == null) {
    return [{path: []}];
  }

  throw new RouteException('Not implemented');
};