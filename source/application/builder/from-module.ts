import {NgModuleFactory, Type} from '@angular/core';

import {FileReference} from '../../filesystem';

import {ApplicationBase} from './impl/application';

export class ApplicationFromModule<V, M> extends ApplicationBase<V, M> {
  constructor(private moduleType: Type<M>, templateDocument?: FileReference | string) {
    super(templateDocument);
  }

  getModuleFactory(): Promise<NgModuleFactory<M>> {
    return this.platform.compileModule(this.moduleType, []);
  }
}
