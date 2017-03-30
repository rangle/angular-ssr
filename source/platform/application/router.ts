import {NgModuleRef} from '@angular/core';

import {NavigationEnd, NavigationError, Router} from '@angular/router';

export const waitForRouterNavigation = <M>(moduleRef: NgModuleRef<M>): Promise<void> => {
  const router: Router = moduleRef.injector.get(Router, null);

  if (router == null || router.navigated) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    router.events.subscribe(event => {
      switch (true) {
        case event instanceof NavigationEnd:
          resolve();
          break;
        case event instanceof NavigationError:
          reject((event as NavigationError).error);
          break;
      }
    });
  });
};