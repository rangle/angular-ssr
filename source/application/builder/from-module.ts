import {NgModuleFactory, Type} from '@angular/core';

import {ApplicationBase} from './application';

import {compileModule} from '../../platform';

export class ApplicationFromModule<V, M> extends ApplicationBase<V, M> {
  constructor(private moduleType: Type<M>) {
    super();
  }

  dispose() {}

  getModuleFactory(): Promise<NgModuleFactory<M>> {
    return compileModule(this.moduleType);
  }
}
