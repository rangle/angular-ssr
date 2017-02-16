import {Route} from '../route';

export interface Snapshot<V> {
  exceptions: Array<Error>;
  renderedDocument: string;
  variant: V;
  applicationState?;
  route: Route;
}