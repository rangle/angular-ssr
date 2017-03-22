import {NgModuleFactory} from '@angular/core';

import {ApplicationRuntimeProject, PlatformImpl, RuntimeModuleLoader, createServerPlatform} from '../../platform';
import {ApplicationBase} from './impl';
import {ApplicationModuleDescriptor, Project} from '../project';
import {CompilableProgram, getCompilableProgram} from './../compiler';
import {FileReference} from '../../filesystem';

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  private program: CompilableProgram;

  constructor(public project: Project, templateDocument?: FileReference | string) {
    super(templateDocument);

    this.program = getCompilableProgram(project);
  }

  dispose() {
    if (this.program) {
      this.program.dispose();
    }

    return super.dispose();
  }

  protected getPlatform(): PlatformImpl {
    const platform = createServerPlatform([
      {provide: ApplicationRuntimeProject, useValue: this},
      {provide: RuntimeModuleLoader, useClass: RuntimeModuleLoader}
    ]);
    return platform as PlatformImpl;
  }

  async getModuleFactoryFromDescriptor(moduleDescriptor: ApplicationModuleDescriptor) {
    return await this.program.loadModule(moduleDescriptor, false);
  }

  async getModuleFactory(): Promise<NgModuleFactory<any>> {
    return await this.program.loadModule(this.project.applicationModule, true);
  }
}
