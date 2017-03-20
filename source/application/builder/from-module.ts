import {NgModuleFactory, Type} from '@angular/core';

import {ApplicationBase} from './impl';

export class ApplicationFromModule<V, M> extends ApplicationBase<V, M> {
  constructor(private moduleType: Type<M>) {
    super();
  }

  getModuleFactory(): Promise<NgModuleFactory<M>> {
    return this.platform.compileModule(this.moduleType, []);
  }
}
