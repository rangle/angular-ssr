import {Type} from '@angular/core';

import {RenderOperation, StateReader} from '../operation';

import {Route} from '../route';

import {VariantDefinitions, permutations} from 'variance';

export abstract class ApplicationBuilder<M, V> {
  protected operation: Partial<RenderOperation<M, V>>;

  constructor(moduleType: Type<M>) {
    this.operation = {moduleType};
  }

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

  stateReader(stateReader: StateReader) {
    this.operation.stateReader = stateReader;
    return this;
  }
}