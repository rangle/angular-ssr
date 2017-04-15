import {Inject, Injectable} from '@angular/core';

import {ApplicationRuntimeProject} from './tokens';

import {RuntimeException} from '../../exception';

@Injectable()
export class RuntimeModuleLoader {
  constructor(@Inject(ApplicationRuntimeProject) private application) {}

  load(moduleId: string): Promise<any> {
    if (this.application == null) {
      throw new RuntimeException('You cannot use the RuntimeModuleLoader with no ApplicationRuntimeProject provided');
    }
    return this.application.load({source: moduleId, symbol: null}, false);
  }
}
