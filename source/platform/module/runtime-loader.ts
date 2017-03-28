import {Inject, Injectable, NgModuleFactory, Optional} from '@angular/core';

import {ApplicationRuntimeProject} from './tokens';

import {ApplicationException} from './../../exception';

@Injectable()
export class RuntimeModuleLoader {
  constructor(@Optional() @Inject(ApplicationRuntimeProject) private application) {}

  load(moduleId: string): Promise<NgModuleFactory<any>> {
    if (this.application == null) {
      throw new ApplicationException('You cannot use the RuntimeModuleLoader with no ApplicationRuntimeProject provided');
    }
    return this.application.getModule({source: moduleId, symbol: null}, false);
  }
}
