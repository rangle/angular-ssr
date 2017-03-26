import {NgModuleFactory} from '@angular/core';

import {FileReference} from '../../filesystem';

import {ApplicationBase} from './impl/application';

export class ApplicationFromModuleFactory<V> extends ApplicationBase<V, any> {
  constructor(private factory: NgModuleFactory<any>, templateDocument?: FileReference | string) {
    super(templateDocument);
  }

  getModuleFactory(): Promise<NgModuleFactory<any>> {
    return Promise.resolve(this.factory);
  }
}
