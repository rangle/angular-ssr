import {Observable} from 'rxjs';

import {ApplicationException} from '../exception';
import {ApplicationBuilderBase} from './base';
import {Snapshot} from '../../snapshot';
import {RenderOperation} from '../../operation';
import {renderableRoutes} from '../../route';
import {renderToStream} from '../render';

export abstract class ApplicationBase<V, M> extends ApplicationBuilderBase<V, M> {
  async render(): Promise<Observable<Snapshot<V>>> {
    this.validate();

    const operation = this.operation;

    operation.moduleFactory = await this.getModuleFactory();

    if (operation.routes == null || operation.routes.length === 0) {
      operation.routes = await renderableRoutes(operation.moduleFactory, this.operation.templateDocument);

      if (operation.routes.length === 0) {
        throw new ApplicationException('No renderable routes were discovered');
      }
    }

    return renderToStream(<RenderOperation<M, V>> this.operation);
  }

  validate() {
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