import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {validateMarkup} from 'dom';

import {ApplicationException} from './exception';
import {Snapshot} from '../snapshot';
import {renderableRoutes} from '../route';
import {ApplicationBuilder} from './builder';

export class Application<M, V> extends ApplicationBuilder<M, V> {
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

    if (validateMarkup(this.operation.templateDocument) === false) {
      throw new ApplicationException(`Invalid template document provided: ${this.operation.templateDocument}`);
    }
  }
}