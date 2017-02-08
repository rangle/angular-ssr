import {RouteException, RenderRoute} from './types';

export const routeToUri = (route: RenderRoute): string => {
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

  return `/${mapped.join('/')}`;
};