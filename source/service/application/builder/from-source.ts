import {NgModuleFactory} from '@angular/core';

import {ApplicationBase} from './application';
import {CompilationException} from '../exception';
import {Project} from './project';

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  constructor(public project: Project) {
    super();
  }

  protected getModuleFactory(): Promise<NgModuleFactory<any>> {
    throw new CompilationException('Not implemented');
  }
}
