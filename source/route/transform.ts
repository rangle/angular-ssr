import urijs = require('urijs');

import {Route} from './route';
import {RouteException} from '../exception';
import {fallbackUri} from '../static';

export const routeToPath = (route: Route): string => {
  const split = route.path.reduce((p, c) => p.concat(c.split('/')), []);

  const mapped = split.map(component => {
    if (component.startsWith(':')) {
      const parameter = component.substring(1);

      if (route.parameters == null || route.parameters.has(parameter) === false) {
        throw new RouteException(`No parameter value for: ${parameter}`);
      }

      return route.parameters.get(parameter);
    }

    return component;
  });

  return mapped.filter(v => v).join('/');
};

export const routeToUri = (route: Route): string => {
  let resultUri = `${fallbackUri}${routeToPath(route)}`;

  if (route.queryString) {
    if (route.queryString.startsWith('?')) {
      route.queryString = route.queryString.substring(1);
    }
    resultUri += `?${route.queryString}`;
  }

  return resultUri;
};

export const pathFromUri = (uri: string): string => urijs(uri).path();
