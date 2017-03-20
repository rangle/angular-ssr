import {NgModuleFactory, Type} from '@angular/core';

import {ApplicationBase} from './impl';

import {compileModule} from '../../platform';

export class ApplicationFromModule<V, M> extends ApplicationBase<V, M> {
  constructor(private moduleType: Type<M>) {
    super();
  }

  getModuleFactory(): Promise<NgModuleFactory<M>> {
    return compileModule(this.platform, this.moduleType);
  }
}
