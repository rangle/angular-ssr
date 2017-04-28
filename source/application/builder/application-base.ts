import {NgModuleFactory, NgModuleRef} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

import chalk = require('chalk');

import uri = require('url');

import {Application} from './application';
import {ServerPlatform, forkZoneExecute, executeBootstrap} from '../../platform';
import {RenderOperation, RenderVariantOperation} from '../operation';
import {Route, applicationRoutes, renderableRoutes} from '../../route';
import {Snapshot, snapshot} from '../../snapshot';
import {composeTransitions} from '../../variants';
import {forkRender} from './fork';

export abstract class ApplicationBase<V, M> implements Application<V> {
  constructor(
    private platform: ServerPlatform,
    private render: RenderOperation,
    private moduleFactory: Promise<NgModuleFactory<M>>
  ) {}

  abstract dispose(): void;

  async prerender(): Promise<Observable<Snapshot<V>>> {
    if (this.render.routes == null || this.render.routes.length === 0) {
      this.render.routes = renderableRoutes(await this.discoverRoutes());
    }

    if (this.render.routes.length === 0) {
      return Observable.of();
    }

    return this.renderToStream(this.render);
  }

  async renderUri(uri: string, variant?: V): Promise<Snapshot<V>> {
    uri = resolveToAbsoluteUri(uri);

    const transition = composeTransitions(this.render.variants, variant);

    const vop: RenderVariantOperation<V> = {scope: this.render, uri, variant, transition};

    return await this.renderVariant(vop);
  }

  async discoverRoutes(): Promise<Array<Route>> {
    const moduleFactory = await this.moduleFactory;

    const {templateDocument} = this.render;

    return await applicationRoutes({platform: this.platform, moduleFactory, templateDocument});
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
    const {uri, transition, scope: {bootstrappers, providers, templateDocument}} = operation;

    const moduleFactory = await this.moduleFactory;

    const bootstrap = <M>(moduleRef: NgModuleRef<M>) => executeBootstrap(moduleRef, bootstrappers, transition);

    const execute = async () => {
      const moduleRef = await this.platform.bootstrapModuleFactory<M>(moduleFactory, providers, bootstrap);
      try {
        return await snapshot(moduleRef, operation);
      }
      finally {
        moduleRef.destroy();
      }
    };

    return await forkZoneExecute(templateDocument, uri, execute);
  }
}

import {FallbackOptions} from '../../static';

let relativeUriWarning = false;

const resolveToAbsoluteUri = (relativeUri: string): string => {
  if (relativeUri == null ||
      relativeUri.length === 0 ||
      relativeUri === '/') {
    return FallbackOptions.fallbackUri;
  }

  const resolved = uri.resolve(FallbackOptions.fallbackUri, relativeUri);

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
