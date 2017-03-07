import {NgModuleFactory} from '@angular/core/index';

import {Observable} from 'rxjs';

import {ApplicationException} from '../../exception';
import {ApplicationBuilderBase} from './base';
import {Snapshot} from '../../snapshot';
import {RenderOperation, RenderVariantOperation} from '../operation';
import {Route, renderableRoutes} from '../../route';
import {renderToStream, renderVariant} from './render';

export abstract class ApplicationBase<V, M> extends ApplicationBuilderBase<V, M> {
  private moduleFactory: NgModuleFactory<M>;

  async prerender(): Promise<Observable<Snapshot<V>>> {
    this.validate();

    const operation = this.operation;

    operation.moduleFactory = await this.getCachedFactory();

    if (operation.routes == null || operation.routes.length === 0) {
      operation.routes = await renderableRoutes(operation.moduleFactory, this.operation.templateDocument);

      if (operation.routes.length === 0) {
        throw new ApplicationException('No renderable routes were discovered');
      }
    }

    return renderToStream(<RenderOperation<M, V>> this.operation);
  }

  async renderRoute(route: Route, variant?: V): Promise<Snapshot<V>> {
    this.validate();

    const operation = <RenderOperation<M, V>> this.operation;

    operation.moduleFactory = await this.getCachedFactory();

    const vop: RenderVariantOperation<M, V> = {
      scope: operation,
      route,
      variant,
    };

    return await renderVariant(vop);
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

  private async getCachedFactory(): Promise<NgModuleFactory<M>> {
    if (this.moduleFactory == null) {
      this.moduleFactory = await this.getModuleFactory();
    }
    return this.moduleFactory;
  }
}