import {
  NgModuleFactory,
  NgModuleRef
} from '@angular/core';

import {Router} from '@angular/router';

import {
  bootstrapModuleFactory,
  forkZone,
} from 'platform';

import {RouteException} from './exception';
import {Route} from './route';

export const renderableRoutes = async <M>(moduleFactory: NgModuleFactory<M>, templateDocument: string): Promise<Array<Route>> => {
  const requestUri = 'http://localhost';

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

  throw new RouteException('Not implemented');
};
