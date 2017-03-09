import {
  NgModuleFactory,
  NgModuleRef
} from '@angular/core/index';

import {
  Router,
  Route as RouteDefinition,
} from '@angular/router/index';

import {
  bootstrapModuleFactory,
  forkZone,
} from '../platform';

import {RouteException} from '../exception';
import {Route} from './route';

export const renderableRoutes = async <M>(moduleFactory: NgModuleFactory<M>, templateDocument: string): Promise<Array<Route>> => {
  const requestUri = 'http://localhost/';

  const routes = await forkZone(templateDocument, requestUri,
    async () =>
      await bootstrapModuleFactory<M, Array<Route>>(
        moduleFactory,
        moduleRef => extractRoutesFromModule(moduleRef)));

  return routes;
};

export const extractRoutesFromRouter = (router: Router): Array<Route> => {
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

export const extractRoutesFromModule = <M>(moduleRef: NgModuleRef<M>): Array<Route> => {
  const router: Router = moduleRef.injector.get(Router, null);
  if (router == null) {
    return [{path: []}]; // application does not use the router at all, so there is one route: /
  }

  return extractRoutesFromRouter(router);
};
