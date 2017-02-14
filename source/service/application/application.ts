import {Observable} from 'rxjs';

import {ApplicationException} from './exception';
import {Snapshot} from '../snapshot';
import {RenderOperation} from '../operation';
import {ApplicationBuilder} from './builder';
import {renderableRoutes} from '../route';
import {renderToStream} from './render';

export class Application<V, M> extends ApplicationBuilder<V, M> {
  async render(): Promise<Observable<Snapshot<V>>> {
    this.validate();

    const {moduleType, routes} = this.operation;

    if (routes == null || routes.length === 0) {
      this.operation.routes = await renderableRoutes(moduleType, this.operation.templateDocument);

      if (this.operation.routes.length === 0) {
        throw new ApplicationException('No renderable routes were discovered');
      }
    }

    return renderToStream(<RenderOperation<M, V>> this.operation);
  }

  validate() {
    if (this.operation.moduleType == null) {
      throw new ApplicationException('No application module type specified');
    }

    if (this.operation.templateDocument == null) {
      throw new ApplicationException('No template HTML document provided');
    }

    const markup = this.operation.templateDocument.trim();
    if (markup.length === 0) {
      throw new ApplicationException('Template document cannot be an empty string');
    }

    if (markup.toLowerCase().indexOf('<!doctype html>') < 0) {
      throw new ApplicationException('Template is missing <!doctype html>');
    }
  }
}