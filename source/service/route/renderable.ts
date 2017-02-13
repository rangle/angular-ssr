import {Type} from '@angular/core';

import {RouteException} from './exception';

import {Route} from './route';

export const renderableRoutes = async <M>(moduleType: Type<M>): Promise<Array<Route>> => {
  throw new RouteException('Not implemented');
};