import {NgModuleFactory} from '@angular/core';

import {ApplicationBase} from './impl';

export class ApplicationFromModuleFactory<V> extends ApplicationBase<V, any> {
  constructor(private factory: NgModuleFactory<any>) {
    super();
  }

  getModuleFactory(): Promise<NgModuleFactory<any>> {
    return Promise.resolve(this.factory);
  }
}
