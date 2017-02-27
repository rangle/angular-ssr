import {NgModuleFactory} from '@angular/core/index';

import {ApplicationBase} from './application';
import {Compiler} from '../compiler';
import {Project} from '../project';

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  private moduleFactory: NgModuleFactory<any>;

  private compiler: Compiler;

  constructor(public project: Project) {
    super();

    this.compiler = new Compiler(project);
  }

  protected async getModuleFactory(): Promise<NgModuleFactory<any>> {
    if (this.moduleFactory == null) {
      this.moduleFactory = await this.compiler.compile();
    }
    return this.moduleFactory;
  }
}
