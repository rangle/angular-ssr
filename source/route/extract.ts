import {NgModuleFactory, NgModuleRef} from '@angular/core';
import {Router, Route as RouteDefinition} from '@angular/router';

import {PlatformImpl, bootstrapWithExecute, forkZone} from '../platform';
import {RouteException} from '../exception';
import {Route} from './route';

export const applicationRoutes = async <M>(platform: PlatformImpl, moduleFactory: NgModuleFactory<M>, templateDocument: string): Promise<Array<Route>> => {
  const requestUri = 'http://localhost/';

  const routes = await forkZone(templateDocument, requestUri,
    async () =>
      await bootstrapWithExecute<M, Array<Route>>(
        platform,
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
        const components = r.path ? r.path.split('/').filter(v => v) : [];

        const path = [...parent, ...components];

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

export const renderableRoutes = (routes: Array<Route>): Array<Route> => {
  const unrenderable = new Set<Route>();

  for (const r of routes) {
    for (const segment of r.path) {
      if (segment.startsWith(':')) {
        if (r.parameters.has(segment.substring(1)) === false) {
          unrenderable.add(r);
        }
      }
    }
  }

  return routes.filter(r => unrenderable.has(r) === false);
};