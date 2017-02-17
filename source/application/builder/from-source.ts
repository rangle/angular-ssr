import {NgModuleFactory} from '@angular/core';

import {ApplicationBase} from './application';
import {Compiler} from '../compiler';
import {Project} from '../project';

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  constructor(public project: Project) {
    super();
  }

  protected async getModuleFactory(): Promise<NgModuleFactory<any>> {
    const compiler = new Compiler(this.project);

    return await compiler.compile();
  }
}
