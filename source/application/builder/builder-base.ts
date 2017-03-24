import {NgModuleFactory} from '@angular/core';

import {ApplicationBuilder} from './builder';
import {ApplicationBootstrapper, ApplicationStateReader, VariantsMap} from '../contracts';
import {RenderOperation} from '../operation';
import {Route} from '../../route';
import {PlatformImpl, createServerPlatform} from './../../platform';

export abstract class ApplicationBuilderBase<M> implements ApplicationBuilder {
  protected operation: Partial<RenderOperation<M>> = {bootstrappers: [], postprocessors: []};

  private platformImpl: PlatformImpl;

  abstract getModuleFactory(): Promise<NgModuleFactory<M>>;

  templateDocument(template?: string) {
    if (template != null) {
      this.operation.templateDocument = template;
    }
    return this.operation.templateDocument;
  }

  bootstrap(bootstrapper?: ApplicationBootstrapper) {
    if (bootstrapper) {
      this.operation.bootstrappers.push(bootstrapper);
    }
    return this.operation.bootstrappers;
  }

  postprocess(transform?: (html: string) => string) {
    if (transform) {
      this.operation.postprocessors.push(transform);
    }
    return this.operation.postprocessors;
  }

  variants(map: VariantsMap) {
    if (map) {
      this.operation.variants = map;
    }
    return this.operation.variants;
  }

  routes(routes?: Array<Route>) {
    if (routes) {
      this.operation.routes = routes;
    }
    return this.operation.routes;
  }

  stateReader(stateReader?: ApplicationStateReader) {
    if (stateReader) {
      this.operation.stateReader = stateReader;
    }
    return this.operation.stateReader;
  }

  get platform(): PlatformImpl {
    if (this.platformImpl == null) {
      this.platformImpl = this.instantiatePlatform();
    }
    return this.platformImpl;
  }

  dispose() {
    const platformImpl = this.platformImpl;
    if (platformImpl) {
      delete this.platformImpl;

      platformImpl.destroy();
    }
  }

  protected instantiatePlatform(): PlatformImpl {
    return createServerPlatform([]) as PlatformImpl;
  }
}