import {NgModuleFactory, NgModuleRef} from '@angular/core';

import {LocationStrategy} from '@angular/common';

import {Router, Route as RouteDefinition} from '@angular/router';

import {PlatformImpl, bootstrapWithExecute, forkZone} from '../platform';
import {RouteException} from '../exception';
import {Route} from './route';
import {baseUri} from '../static';

export const applicationRoutes = async <M>(platform: PlatformImpl, moduleFactory: NgModuleFactory<M>, templateDocument: string): Promise<Array<Route>> => {
  const routes = await forkZone(templateDocument, baseUri,
    async () =>
      await bootstrapWithExecute<M, Array<Route>>(
        platform,
        moduleFactory,
        moduleRef => extractRoutesFromModule(moduleRef)));

  return routes;
};

export const extractRoutesFromRouter = (router: Router, locationStrategy: LocationStrategy): Array<Route> => {
  if (router.config == null) {
    throw new RouteException(`Router configuration not found`);
  }

  const flatten = (parent: Array<string>, routes: Array<RouteDefinition>): Array<Route> => {
    if (routes == null || routes.length === 0) {
      return new Array<Route>();
    }

    const separator = '/';

    return routes.reduce(
      (prev, r) => {
        const components = (r.path || String()).split(separator).filter(v => v);

        const prepared = locationStrategy.prepareExternalUrl(parent.concat(components).join(separator));

        const path = prepared.split(separator).filter(v => v);

        return prev.concat({path}, flatten(path, r.children));
      },
      new Array<Route>());
  };

  return flatten([], router.config);
};

export const extractRoutesFromModule = <M>(moduleRef: NgModuleRef<M>): Array<Route> => {
  const routes = new Array<Route>();

  const router: Router = moduleRef.injector.get(Router, null);
  if (router == null) {
    routes.push({path: []});
  }
  else {
    routes.push(...extractRoutesFromRouter(router, moduleRef.injector.get(LocationStrategy)));
  }

  return routes;
};

export const renderableRoutes = (routes: Array<Route>): Array<Route> => {
  const unrenderable = new Set<Route>();

  for (const r of routes) {
    if (r.path.some(segment => segment.startsWith(':'))) {
      unrenderable.add(r);
    }
  }

  return routes.filter(r => unrenderable.has(r) === false);
};