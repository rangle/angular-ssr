import {Type} from '@angular/core';

import {RenderOperation, ApplicationStateReader} from '../../operation';

import {Route} from '../../route';

import {VariantDefinitions, permutations} from 'variance';

export abstract class ApplicationBuilderBase<V, M> {
  protected operation: Partial<RenderOperation<M, V>> = {};

  protected abstract getModule(): Promise<Type<M>>;

  templateDocument(template: string) {
    this.operation.templateDocument = template;
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
}