import {Type} from '@angular/core';

import {ApplicationBase} from './application';

export class ApplicationFromModule<V, M> extends ApplicationBase<V, M> {
  constructor(private moduleType: Type<M>) {
    super();
  }

  protected getModule(): Promise<Type<M>> {
    return Promise.resolve(this.moduleType);
  }
}
