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

    if (typeof this.application.load !== 'function') {
      throw new RuntimeException(`This type of application does not support lazy loading (only applicationBuilderFromSource() does)`);
    }

    return this.application.load({source: moduleId, symbol: null}, false);
  }
}
