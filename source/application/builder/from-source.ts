import {NgModuleFactory} from '@angular/core/index';

import {CompilableProgram, getCompilableProgram} from './../compiler';
import {ApplicationBase} from './application';
import {Project} from '../project';

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  private compilable: CompilableProgram;

  constructor(public project: Project) {
    super();

    this.compilable = getCompilableProgram(project);
  }

  protected async getModuleFactory(): Promise<NgModuleFactory<any>> {
    return await this.compilable.loadModule(this.project.applicationModule);
  }
}
