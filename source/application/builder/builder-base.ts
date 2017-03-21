import {Injector, NgModuleFactory} from '@angular/core';

import {ApplicationBuilder} from './builder';
import {RenderOperation, ApplicationStateReader} from '../operation';
import {Route} from '../../route';
import {VariantDefinitions, permutations} from '../../variants';
import {PlatformImpl, createServerPlatform} from './../../platform';

export abstract class ApplicationBuilderBase<V, M> implements ApplicationBuilder {
  protected operation: Partial<RenderOperation<M, V>> = {};

  private platformImpl: PlatformImpl;

  abstract getModuleFactory(): Promise<NgModuleFactory<M>>;

  templateDocument(template: string) {
    this.operation.templateDocument = template;
    return this;
  }

  bootstrap(fn: (injector: Injector) => void) {
    if (this.operation.bootstrap == null) {
      this.operation.bootstrap = [];
    }
    this.operation.bootstrap.push(fn);
    return this;
  }

  postprocess(transform: (html: string) => string) {
    if (this.operation.postprocessors == null) {
      this.operation.postprocessors = [];
    }
    this.operation.postprocessors.push(transform);
    return this;
  }

  variants(definitions: VariantDefinitions) {
    this.operation.variants = permutations<V>(definitions);
    return this;
  }

  routes(routes: Array<Route>) {
    this.operation.routes = routes;
    return this;
  }

  stateReader(stateReader: ApplicationStateReader) {
    this.operation.stateReader = stateReader;
    return this;
  }

  protected getPlatform(): PlatformImpl {
    return <PlatformImpl> createServerPlatform([]);
  }

  get platform(): PlatformImpl {
    if (this.platformImpl == null) {
      this.platformImpl = this.getPlatform();
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
}