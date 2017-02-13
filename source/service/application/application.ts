import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {Snapshot} from '../snapshot';
import {RenderOperation, StateReader} from '../operation';
import {Route, renderableRoutes} from '../route';
import {ApplicationException} from './exception';
import {validateHtml} from 'dom';
import {ComposedTransition, VariantDefinitions, permutations} from 'variance';

export class Application<M, V> {
  private operation: Partial<RenderOperation<M, V>>;

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

  async render(): Promise<Observable<Snapshot<V>>> {
    this.validate();

    const {moduleType, routes} = this.operation;

    if (routes == null || routes.length === 0) {
      this.operation.routes = await renderableRoutes(moduleType);

      if (this.operation.routes.length === 0) {
        throw new ApplicationException('No renderable routes were discovered');
      }
    }

    return Observable.create(publish => {
      publish.error(new ApplicationException('Not implemented'));
    });
  }

  validate() {
    if (this.operation.moduleType == null) {
      throw new ApplicationException('No application module type specified');
    }

    if (validateHtml(this.operation.templateDocument) === false) {
      throw new ApplicationException(`Invalid template document provided: ${this.operation.templateDocument}`);
    }
  }
}