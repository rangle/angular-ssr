import {NgModuleRef} from '@angular/core';

import {Router} from '@angular/router';

import {
  NavigateException,
  RenderRoute,
  routeToUri,
} from './types';

export const navigateRoute = async <M>(moduleRef: NgModuleRef<M>, route: RenderRoute): Promise<void> => {
  const router: Router = moduleRef.injector.get(Router);

  const uri = routeToUri(route);

  const navigated = await router.navigateByUrl(uri);

  if (navigated === false) {
    if (route.redirects === false) {
      throw new NavigateException(`Failed to navigate to route URI: ${uri}`);
    }
  }
};
