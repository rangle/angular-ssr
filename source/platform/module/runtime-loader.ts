import {Inject, Injectable, NgModuleFactory} from '@angular/core';

import {ApplicationRuntimeProject} from './tokens';

@Injectable()
export class RuntimeModuleLoader {
  constructor(@Inject(ApplicationRuntimeProject) private application) {}

  load(moduleId: string): Promise<NgModuleFactory<any>> {
    return this.application.getModuleFactoryFromDescriptor({source: moduleId, symbol: null}, false);
  }
}
