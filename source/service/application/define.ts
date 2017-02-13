import {Type} from '@angular/core';

import {RenderOperation, StateReader} from '../operation';

import {Route} from '../route';

import {VariantDefinitions, permutations} from 'variance';

export abstract class ApplicationDefinition<M, V> {
  protected operation: Partial<RenderOperation<M, V>>;

  constructor(moduleType: Type<M>) {
    this.operation = {moduleType};
  }

  templateDocument(template: string): void {
    this.operation.templateDocument = template;
  }

  variants(definitions: VariantDefinitions): void {
    this.operation.variants = permutations<V>(definitions);
  }

  routes(routes: Array<Route>): void {
    this.operation.routes = routes;
  }

  stateReader(stateReader: StateReader) {
    this.operation.stateReader = stateReader;
  }
}