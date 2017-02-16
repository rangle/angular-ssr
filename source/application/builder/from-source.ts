import {NgModuleFactory} from '@angular/core';

import {ApplicationBase} from './application';
import {CompilerException} from 'exception';
import {Project} from '../project';

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  constructor(public project: Project) {
    super();
  }

  protected getModuleFactory(): Promise<NgModuleFactory<any>> {
    throw new CompilerException('Not implemented');
  }
}
