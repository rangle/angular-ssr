import {Inject, Injectable, NgModuleFactory} from '@angular/core';

import {ApplicationRuntimeProject} from './tokens';

@Injectable()
export class RuntimeModuleLoader {
  constructor(@Inject(ApplicationRuntimeProject) private application) {}

  load(moduleId: string): Promise<NgModuleFactory<any>> {
    const [source, symbol] = moduleId.split('#');

    return this.application.getModuleFactoryFromDescriptor({source, symbol});
  }
}
