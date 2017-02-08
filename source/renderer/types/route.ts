import {RenderException} from './exception';

export interface RenderRoute {
  path: Array<string>;
  parameters: Map<string, string>;
  redirects?: boolean;
}

export const routeToUri = (route: RenderRoute): string => {
  const split = route.path.reduce((p, c) => p.concat(c.split('/')), []);

  const mapped = split.map(component => {
    if (component.startsWith(':')) {
      const parameter = component.substring(1);

      if (route.parameters == null || route.parameters.has(parameter) === false) {
        throw new RenderException(`No parameter value for: ${parameter}`);
      }

      return route.parameters.get(parameter);
    }
  });

  return `/${mapped.join('/')}`;
};