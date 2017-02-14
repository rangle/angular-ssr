import {Route} from '../route';

export interface Snapshot<V> {
  renderedDocument: string;
  variant: V;
  applicationState?;
  route: Route;
}