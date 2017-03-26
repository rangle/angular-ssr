import {NgModuleFactory} from '@angular/core';

import {ApplicationRuntimeProject, PlatformImpl, RuntimeModuleLoader, createServerPlatform} from '../../platform';
import {ApplicationBase} from './impl/application';
import {ApplicationModuleDescriptor, Project} from '../project';
import {CompilableProgram, getCompilableProgram} from '../compiler';
import {FileReference} from '../../filesystem';

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  private program: CompilableProgram;

  constructor(public project: Project, templateDocument?: FileReference | string) {
    super(templateDocument);

    this.program = getCompilableProgram(project);
  }

  async getModuleFactoryFromDescriptor(moduleDescriptor: ApplicationModuleDescriptor) {
    return await this.program.loadModule(moduleDescriptor, false);
  }

  async getModuleFactory(): Promise<NgModuleFactory<any>> {
    return await this.program.loadModule(this.project.applicationModule, true);
  }

  dispose() {
    if (this.program) {
      this.program.dispose();
    }

    if (this.platformRef) {
      this.platformRef.destroy();
      this.platformRef = null;
    }

    return super.dispose();
  }

  get platform(): PlatformImpl {
    if (this.platformRef == null) {
      this.platformRef = this.instantiatePlatform();
    }
    return this.platformRef;
  }

  private instantiatePlatform(): PlatformImpl {
    return createServerPlatform([
      {provide: ApplicationRuntimeProject, useValue: this},
      {provide: RuntimeModuleLoader, useClass: RuntimeModuleLoader}
    ]) as PlatformImpl;
  }

  private platformRef: PlatformImpl;
}
