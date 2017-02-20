import {
  NgModuleFactory,
  NgModuleRef
} from '@angular/core';

import {
  Router,
  Route as RouteDefinition,
} from '@angular/router';

import {
  bootstrapModuleFactory,
  forkZone,
} from 'platform';

import {RouteException} from 'exception';
import {Route} from './route';

export const renderableRoutes = async <M>(moduleFactory: NgModuleFactory<M>, templateDocument: string): Promise<Array<Route>> => {
  const requestUri = 'http://localhost/';

  const routes = await forkZone(templateDocument, requestUri,
    async () =>
      await bootstrapModuleFactory<M, Array<Route>>(
        moduleFactory,
        moduleRef => extractRoutes(moduleRef)));

  return routes;
};

const extractRoutes = <M>(moduleRef: NgModuleRef<M>): Array<Route> => {
  const router: Router = moduleRef.injector.get(Router, null);
  if (router == null) {
    return [{path: []}]; // application does not use the router at all
  }

  if (router.config == null) {
    throw new RouteException(`Router configuration not found`);
  }

  const flatten = (parent: Array<string>, routes: Array<RouteDefinition>): Array<Route> => {
    if (routes == null || routes.length === 0) {
      return new Array<Route>();
    }

    return routes.reduce(
      (prev, r) => {
        const path = parent.concat(r.path ? r.path.split('/') : []);

        return [...prev, {path}, ...flatten(path, r.children)];
      },
      new Array<Route>());
  };

  return flatten(new Array<string>(), router.config);
};
