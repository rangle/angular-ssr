import uri = require('url');
import chalk = require('chalk');

import {NgModuleFactory} from '@angular/core';

import {Observable, Subject} from 'rxjs';

import {ApplicationException} from '../../../exception';
import {ApplicationBuilderBase} from '../builder-base';
import {FileReference, fileFromString} from '../../../filesystem';
import {Snapshot, snapshot} from '../../../snapshot';
import {RenderOperation, RenderVariantOperation} from '../../operation';
import {applicationRoutes} from '../../../route';
import {bootstrapWithExecute, forkZone} from '../../../platform';
import {baseUri} from '../../../static';
import {composeTransitions} from '../../../variants';
import {fork} from './fork';

export abstract class ApplicationBase<V, M> extends ApplicationBuilderBase<M> {
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

  async prerender(): Promise<Observable<Snapshot<V>>> {
    this.validate();

    const operation = this.operation;

    operation.moduleFactory = await this.getCachedFactory();

    if (operation.routes == null || operation.routes.length === 0) {
      let routes = await applicationRoutes(this.platform, operation.moduleFactory, this.operation.templateDocument);

      routes = routes.filter(r => r.path.every(p => p.startsWith(':') === false)); // no parameters allowed

      if (routes.length === 0) {
        return Observable.of();
      }

      operation.routes = routes;
    }

    return this.renderToStream(<RenderOperation<M>> this.operation);
  }

  async renderUri(uri: string, variant?: V): Promise<Snapshot<V>> {
    this.validate();

    uri = resolveToAbsoluteUri(uri);

    const operation = <RenderOperation<M>> this.operation;

    operation.moduleFactory = await this.getCachedFactory();

    const transition = composeTransitions(this.operation.variants, variant);

    const vop: RenderVariantOperation<M, V> = {scope: operation, uri, variant, transition};

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

  protected renderToStream<M, V>(operation: RenderOperation<M>): Observable<Snapshot<V>> {
    const subject = new Subject<Snapshot<V>>();

    const bind = async (suboperation: RenderVariantOperation<M, V>) => {
      try {
        subject.next(await this.renderVariant(suboperation));
      }
      catch (exception) {
        subject.error(exception);
      }
    };

    const promises = fork<M, V>(operation).map(suboperation => bind(suboperation));

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

    const instantiate = () =>
      bootstrapWithExecute<M, Snapshot<V>>(this.platform, moduleFactory, ref => snapshot(ref, operation));

    return await forkZone(templateDocument, uri, instantiate);
  }
}

let relativeUriWarning = false;

const resolveToAbsoluteUri = (relativeUri: string): string => {
  if (relativeUri == null ||
      relativeUri.length === 0 ||
      relativeUri === '/') {
    return baseUri;
  }

  const resolved = uri.resolve(baseUri, relativeUri);

  if (resolved !== relativeUri) {
    if (relativeUriWarning === false) {
      console.warn(chalk.yellow(`It is best to avoid using relative URIs like ${relativeUri} when requesting render results`));
      console.warn(chalk.yellow('The reason is that your application may key its service URIs from "window.location" in some manner'));
      console.warn(chalk.yellow(`I have resolved this relative URI to ${resolved} and this may impact your application`));
      relativeUriWarning = true;
    }
  }

  return resolved;
};