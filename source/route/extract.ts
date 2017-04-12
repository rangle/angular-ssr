import {NgModuleFactory, NgModuleRef} from '@angular/core';

import {Location} from '@angular/common';

import {Router, Routes} from '@angular/router';

import {ServerPlatform, bootstrapWithExecute, forkZone} from '../platform';
import {Route} from './route';
import {fallbackUri} from '../static';
import {routeToPathWithParameters} from './transform';
import {waitForApplicationToBecomeStable, waitForRouterNavigation} from '../platform/application';

export const applicationRoutes =
    <M>(platform: ServerPlatform, moduleFactory: NgModuleFactory<M>, templateDocument: string): Promise<Array<Route>> => {
  // NOTE(bond): The way that we attempt to extract routes from an NgModuleFactory is to actually
  // instantiate the application and then query the configuration from the Router module. This is
  // cleaner and much easier than attempting to collect all the routes from every @NgModule in the
  // application, including lazily loaded modules. And because we only ever have to do it once (to
  // discover the routes), there is no negative performance impact except maybe startup time.
  //
  // One kink of this approach is that some applications put complex operations inside their module
  // constructors. For example, it's fairly common to see an NgModule which kicks off an HTTP request
  // inside of its constructor (or indirectly, in a function called from the constructor). So even
  // though we really don't want to do a complete bootstrap and render, we have to wait for those
  // operations to finish and for the zone to stabilize before we can destroy the module instance.
  // Otherwise those asynchronous operations will have the rug pulled from under them and cause
  // all kinds of nasty console errors.

  return forkZone(templateDocument, fallbackUri,
    () => bootstrapWithExecute<M, Route[]>(
      platform,
      moduleFactory,
      async (moduleRef) => {
        await waitForRouterNavigation(moduleRef);

        await waitForApplicationToBecomeStable(moduleRef);

        return extractRoutesFromModule(moduleRef);
      }));
};

export const extractRoutesFromRouter = (router: Router, location: Location): Array<Route> => {
  const empty = new Array<Route>();

  if (router == null ||
      router.config == null ||
      router.config.length === 0) {
    return empty;
  }

  const flatten = (parent: Array<string>, routes: Routes): Array<Route> =>
    routes.reduce(
      (prev, route) => {
        const prepared = location.prepareExternalUrl(parent.concat(route.path).join('/'));

        const path = prepared.replace(/(^\.|\*\*?)/g, String()).split(/\//g).filter(v => v);

        return prev.concat({path}, flatten(path, route.children || []));
      },
      empty);

  return uniqueRoutes(flatten(new Array<string>(), router.config));
};

const singleRoute: Route = {path: []};

export const extractRoutesFromModule = <M>(moduleRef: NgModuleRef<M>): Array<Route> => {
  const router: Router = moduleRef.injector.get(Router, null);
  if (router == null) {
    return [singleRoute];
  }

  const location: Location = moduleRef.injector.get(Location);

  return extractRoutesFromRouter(router, location);
};

export const renderableRoutes = (routes: Array<Route>): Array<Route> => {
  const isParameter = (segment: string) => segment.startsWith(':');

  const unrenderable = new Set<Route>(routes.filter(({path}) => path.some(isParameter)));

  return routes.filter(r => unrenderable.has(r) === false);
};

export const uniqueRoutes = (routes: Array<Route>): Array<Route> => {
  const map = new Map<string, Route>();

  for (const r of routes) {
    map.set(routeToPathWithParameters(r), r);
  }

  return Array.from(map.values());
};
