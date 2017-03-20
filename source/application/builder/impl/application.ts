import {NgModuleFactory} from '@angular/core';

import {Observable, Subject} from 'rxjs';

import {ApplicationException} from '../../../exception';
import {ApplicationBuilderBase} from '../builder';
import {Snapshot, takeSnapshot} from '../../../snapshot';
import {RenderOperation, RenderVariantOperation} from '../../operation';
import {Route, renderableRoutes, routeToUri} from '../../../route';
import {bootstrapWithExecute, forkZone} from '../../../platform';
import {fork} from './fork';

export abstract class ApplicationBase<V, M> extends ApplicationBuilderBase<V, M> {
  private moduleFactory: NgModuleFactory<M>;

  async prerender(): Promise<Observable<Snapshot<V>>> {
    this.validate();

    const operation = this.operation;

    operation.moduleFactory = await this.getCachedFactory();

    if (operation.routes == null || operation.routes.length === 0) {
      operation.routes = await renderableRoutes(this.platform, operation.moduleFactory, this.operation.templateDocument);

      if (operation.routes.length === 0) {
        throw new ApplicationException('No renderable routes were discovered');
      }
    }

    return this.renderToStream(<RenderOperation<M, V>> this.operation);
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

    return await this.renderVariant(vop);
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

  protected renderToStream<M, V>(operation: RenderOperation<M, V>): Observable<Snapshot<V>> {
    const subject = new Subject<Snapshot<V>>();

    const bind = async (suboperation: RenderVariantOperation<M, V>) => {
      try {
        subject.next(await this.renderVariant(suboperation));
      }
      catch (exception) {
        subject.error(exception);
      }
    };

    const promises = fork(operation).map(suboperation => bind(suboperation));

    Promise.all(promises).then(() => subject.complete());

    return subject.asObservable();
  }

  protected async renderVariant<M, V>(operation: RenderVariantOperation<M, V>): Promise<Snapshot<V>> {
    const {
      route,
      scope: {
        templateDocument,
        moduleFactory,
      }
    } = operation;

    const absoluteUri = routeToUri(route);

    return await forkZone(templateDocument, absoluteUri, () =>
      bootstrapWithExecute<M, Snapshot<V>>(
        this.platform,
        moduleFactory,
        moduleRef => takeSnapshot(moduleRef, operation)));
  }
}