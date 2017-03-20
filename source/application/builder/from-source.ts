import {NgModuleFactory} from '@angular/core';

import {CompilableProgram, getCompilableProgram} from './../compiler';
import {ApplicationRuntimeProject, PlatformImpl, createServerPlatform} from '../../platform';
import {ApplicationBase} from './impl';
import {ApplicationModuleDescriptor, Project} from '../project';

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

  protected getPlatform(): PlatformImpl {
    return <PlatformImpl> createServerPlatform([
      {provide: ApplicationRuntimeProject, useValue: this},
    ]);
  }

  async getModuleFactoryFromDescriptor(moduleDescriptor: ApplicationModuleDescriptor) {
    return await this.program.loadModule(moduleDescriptor);
  }

  async getModuleFactory(): Promise<NgModuleFactory<any>> {
    return await this.getModuleFactoryFromDescriptor(this.project.applicationModule);
  }
}
