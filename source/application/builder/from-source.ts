import {NgModuleFactory} from '@angular/core';

import {CompilableProgram, getCompilableProgram} from './../compiler';
import {ApplicationBase} from './impl';
import {Project} from '../project';

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  private program: CompilableProgram;

  constructor(public project: Project) {
    super();

    this.program = getCompilableProgram(project);
  }

  dispose() {
    this.program.dispose();

    return super.dispose();
  }

  async getModuleFactory(): Promise<NgModuleFactory<any>> {
    return await this.program.loadModule(this.project.applicationModule);
  }
}
