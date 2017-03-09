import {NgModuleFactory} from '@angular/core/index';

import {CompilableProgram, getCompilableProgram} from './../compiler';
import {ApplicationBase} from './application';
import {Project} from '../project';

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  private program: CompilableProgram;

  constructor(public project: Project) {
    super();

    this.program = getCompilableProgram(project);
  }

  dispose() {
    this.program.dispose();
  }

  protected async getModuleFactory(): Promise<NgModuleFactory<any>> {
    return await this.program.loadModule(this.project.applicationModule);
  }
}
