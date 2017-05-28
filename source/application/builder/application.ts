import {Disposable} from '../../disposable';
import {Observable} from 'rxjs/Observable';
import {PrerenderOptions} from './options';
import {Route} from '../../route';
import {Snapshot} from '../../snapshot';

export interface Application<V> extends Disposable {
  // Render the specified absolute URI with optional variant
  renderUri(uri: string, variant?: V): Promise<Snapshot<V>>;

  // Prerender all of the routes provided from the ApplicationBuilder. If no routes were
  // provided, they will be discovered using discoverRoutes() and filtered down to the
  // routes that do not require parameters (eg /blog/:id will be excluded, / will not)
  prerender(options?: PrerenderOptions): Observable<Snapshot<V>>;

  // Discover all of the routes defined in all the NgModules of this application
  discoverRoutes(): Promise<Array<Route>>;
}