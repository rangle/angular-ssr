import {NgModuleFactory} from '@angular/core';

import {ApplicationBuilder} from './builder';
import {ApplicationBootstrapper, ApplicationStateReader, Postprocessor, VariantsMap} from '../contracts';
import {RenderOperation} from '../operation';
import {Route} from '../../route';
import {PlatformImpl, createServerPlatform} from './../../platform';

const basePlatform = createServerPlatform();

export abstract class ApplicationBuilderBase<M> implements ApplicationBuilder {
  protected operation: Partial<RenderOperation<M>> = {};

  abstract getModuleFactory(): Promise<NgModuleFactory<M>>;

  get platform(): PlatformImpl {
    return basePlatform as PlatformImpl;
  }

  preboot(enabled?: boolean) {
    if (enabled != null) {
      this.operation.preboot = enabled;
    }
    return this.operation.preboot;
  }

  templateDocument(template?: string) {
    if (template != null) {
      this.operation.templateDocument = template;
    }
    return this.operation.templateDocument;
  }

  bootstrap(bootstrapper?: ApplicationBootstrapper) {
    if (bootstrapper) {
      if (this.operation.bootstrappers == null) {
        this.operation.bootstrappers = [];
      }
      this.operation.bootstrappers.push(bootstrapper);
    }
    return this.operation.bootstrappers;
  }

  postprocess(transform?: Postprocessor) {
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

  stateReader<R>(stateReader?: ApplicationStateReader<R>) {
    if (stateReader) {
      this.operation.stateReader = stateReader;
    }
    return this.operation.stateReader;
  }

  dispose() {}
}
