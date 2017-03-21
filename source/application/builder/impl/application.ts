import {NgModuleFactory} from '@angular/core';

import {Observable, Subject} from 'rxjs';

import {ApplicationException} from '../../../exception';
import {ApplicationBuilderBase} from '../builder-base';
import {FileReference, fileFromString} from '../../../filesystem';
import {Snapshot, takeSnapshot} from '../../../snapshot';
import {RenderOperation, RenderVariantOperation} from '../../operation';
import {applicationRoutes} from '../../../route';
import {bootstrapWithExecute, forkZone} from '../../../platform';
import {fork} from './fork';

export abstract class ApplicationBase<V, M> extends ApplicationBuilderBase<V, M> {
  private moduleFactory: NgModuleFactory<M>;

  constructor(templateDocument?: FileReference | string) {
    super();

    if (templateDocument) {
      templateDocument = fileFromString(templateDocument);

      if (templateDocument.exists() === false) {
        throw new ApplicationException(`Your template document does not exist: ${templateDocument.toString()}`);
      }

      this.templateDocument(templateDocument.content());
    }
  }

  // Prerender all discovered routes that do not take parameters
  async prerender(): Promise<Observable<Snapshot<V>>> {
    this.validate();

    const operation = this.operation;

    operation.moduleFactory = await this.getCachedFactory();

    if (operation.routes == null || operation.routes.length === 0) {
      operation.routes = await applicationRoutes(this.platform, operation.moduleFactory, this.operation.templateDocument);

      operation.routes = operation.routes.filter(r => r.path.every(p => p.startsWith(':') === false)); // no parameters

      if (operation.routes.length === 0) {
        throw new ApplicationException('No renderable routes were discovered');
      }
    }

    return this.renderToStream(<RenderOperation<M, V>> this.operation);
  }

  // Render the application based on the specified URI (must be a complete URI including hostname and scheme)
  async renderUri(uri: string, variant?: V): Promise<Snapshot<V>> {
    this.validate();

    const operation = <RenderOperation<M, V>> this.operation;

    operation.moduleFactory = await this.getCachedFactory();

    const vop: RenderVariantOperation<M, V> = {scope: operation, uri, variant};

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

    if (/<!doctype html>/i.test(markup) === false) {
      throw new ApplicationException('Template document has no doctype element');
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
      uri,
      scope: {
        templateDocument,
        moduleFactory,
      }
    } = operation;

    return await forkZone(templateDocument, uri, () =>
      bootstrapWithExecute<M, Snapshot<V>>(
        this.platform,
        moduleFactory,
        moduleRef => takeSnapshot(moduleRef, operation)));
  }
}