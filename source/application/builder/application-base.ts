import {NgModuleFactory} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

import chalk = require('chalk');

import uri = require('url');

import {Application} from './application';
import {ServerPlatform, bootstrapWithExecute, forkZone} from '../../platform';
import {RenderOperation, RenderVariantOperation} from '../operation';
import {Route, applicationRoutes, renderableRoutes} from '../../route';
import {Snapshot, snapshot} from '../../snapshot';
import {fallbackUri} from '../../static';
import {composeTransitions} from '../../variants';
import {forkRender} from './fork';
import {none} from '../../predicate';

export abstract class ApplicationBase<V, M> implements Application<V> {
  constructor(
    private platformImpl: ServerPlatform,
    private render: RenderOperation,
    private moduleFactory: () => Promise<NgModuleFactory<M>>
  ) {}

  abstract dispose(): void;

  async prerender(): Promise<Observable<Snapshot<V>>> {
    if (none(this.render.routes)) {
      this.render.routes = renderableRoutes(await this.discoverRoutes());

      if (none(this.render.routes)) {
        return Observable.of();
      }
    }

    return this.renderToStream(this.render);
  }

  renderUri(uri: string, variant?: V): Promise<Snapshot<V>> {
    uri = resolveToAbsoluteUri(uri);

    const transition = composeTransitions(this.render.variants, variant);

    const vop: RenderVariantOperation<V> = {scope: this.render, uri, variant, transition};

    return this.renderVariant(vop);
  }

  async discoverRoutes(): Promise<Array<Route>> {
    const moduleFactory = await this.moduleFactory();

    return await applicationRoutes(this.platformImpl, moduleFactory, this.render.templateDocument);
  }

  private renderToStream(operation: RenderOperation): Observable<Snapshot<V>> {
    const subject = new ReplaySubject<Snapshot<V>>();

    const bind = async (suboperation: RenderVariantOperation<V>) => {
      try {
        subject.next(await this.renderVariant(suboperation));
      }
      catch (exception) {
        subject.error(exception);
      }
    };

    const promises = forkRender<V>(operation).map(suboperation => bind(suboperation));

    Promise.all(promises).then(() => subject.complete());

    return subject;
  }

  private async renderVariant(operation: RenderVariantOperation<V>): Promise<Snapshot<V>> {
    const {uri, scope: {templateDocument}} = operation;

    const moduleFactory = await this.moduleFactory();

    return forkZone(templateDocument, uri,
      () => bootstrapWithExecute<M, Snapshot<V>>(this.platformImpl, moduleFactory, ref => snapshot(ref, operation)));
  }
}

let relativeUriWarning = false;

const resolveToAbsoluteUri = (relativeUri: string): string => {
  if (relativeUri == null ||
      relativeUri.length === 0 ||
      relativeUri === '/') {
    return fallbackUri;
  }

  const resolved = uri.resolve(fallbackUri, relativeUri);

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
