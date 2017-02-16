import {NgModuleFactory} from '@angular/core';

import {ApplicationBase} from './application';

export class ApplicationFromModuleFactory<V> extends ApplicationBase<V, any> {
  constructor(private moduleFactory: NgModuleFactory<any>) {
    super();
  }

  protected getModuleFactory(): Promise<NgModuleFactory<any>> {
    return Promise.resolve(this.moduleFactory);
  }
}
