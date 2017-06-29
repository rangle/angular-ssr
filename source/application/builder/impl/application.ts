import {NgModuleFactory, NgModuleRef} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

import chalk = require('chalk');

import uri = require('url');

import {Application} from '../application';
import {ApplicationFallbackOptions} from '../../../static';
import {ModuleDeclaration} from '../../project';
import {PrerenderOptions} from '../options';
import {RenderOperation, RenderVariantOperation} from '../../operation';
import {Route, applicationRoutes, renderableRoutes} from '../../../route';
import {ServerPlatform, executeBootstrap, forkZoneExecute} from '../../../platform';
import {Snapshot, snapshot} from '../../../snapshot';
import {composeTransitions} from '../../../variants';
import {forkRender} from '../fork';

export class ApplicationImpl<V, M> implements Application<V> {
  constructor(
    private readonly platform: ServerPlatform,
    private readonly render: RenderOperation,
    private readonly moduleFactory: Promise<NgModuleFactory<M>>,
    public readonly load: (module: ModuleDeclaration) => Promise<any>,
    public readonly dispose: () => void | Promise<void>
  ) {}

  prerender(options: PrerenderOptions = {pessimistic: false}): Observable<Snapshot<V>> {
    this.render.pessimistic = options.pessimistic || false;

    return Observable.create(async (observe) => {
      if (this.render.routes == null || this.render.routes.length === 0) {
        this.render.routes = renderableRoutes(await this.discoverRoutes());
      }

      if (this.render.blacklist) { // route blacklisting
        this.render.routes = this.render.routes.filter((r: Route & {server?: boolean}) => r.server === true);
      }

      if (this.render.routes.length === 0) {
        observe.complete();
      }
      else {
        this.renderToStream(this.render)
          .subscribe(
            observe.next.bind(observe),
            observe.error.bind(observe),
            observe.complete.bind(observe));
      }
    });
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
        if (operation.pessimistic === false) {
          subject.error(exception);
        }
      }
    };

    const promises = forkRender<V>(operation).map(suboperation => bind(suboperation));

    Promise.all(promises).then(() => subject.complete());

    return Observable.from(subject);
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

let relativeUriWarning = false;

const resolveToAbsoluteUri = (relativeUri: string): string => {
  if (relativeUri == null ||
      relativeUri.length === 0 ||
      relativeUri === '/') {
    return ApplicationFallbackOptions.fallbackUri;
  }

  const resolved = uri.resolve(ApplicationFallbackOptions.fallbackUri, relativeUri);

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
