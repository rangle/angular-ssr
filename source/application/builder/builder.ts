import {Injector, NgModuleFactory, PlatformRef} from '@angular/core';

import {Disposable} from '../../disposable';
import {RenderOperation, ApplicationStateReader} from '../operation';
import {Route} from '../../route';
import {VariantDefinitions, permutations} from '../../variance';
import {PlatformImpl, createServerPlatform} from './../../platform';

export abstract class ApplicationBuilderBase<V, M> implements Disposable {
  protected operation: Partial<RenderOperation<M, V>> = {};

  protected platform = <PlatformImpl> createServerPlatform([]);

  abstract getModuleFactory(): Promise<NgModuleFactory<M>>;

  getPlatform(): PlatformRef {
    return <PlatformRef> this.platform;
  }

  dispose(): Promise<void> {
    if (this.platform) {
      return this.platform.destroy().then(() => {
        delete this.platform;
      });
    }
    return Promise.resolve(void 0);
  }

  templateDocument(template: string) {
    this.operation.templateDocument = template;
    return this;
  }

  bootstrap(fn: (injector: Injector) => void) {
    if (this.operation.bootstrap == null) {
      this.operation.bootstrap = [];
    }
    this.operation.bootstrap.push(fn);
  }

  postprocess(transform: (html: string) => string) {
    if (this.operation.postprocessors == null) {
      this.operation.postprocessors = [];
    }
    this.operation.postprocessors.push(transform);
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
}