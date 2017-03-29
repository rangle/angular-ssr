import {Type} from '@angular/core';

import {FileReference} from '../../filesystem';

import {Application} from './application';
import {ApplicationBuilderBase} from './builder-base';
import {RenderOperation} from '../operation';
import {PlatformImpl, createJitPlatform} from '../../platform';

export class ApplicationBuilderFromModule<V, M> extends ApplicationBuilderBase<M> {
  constructor(private moduleType: Type<M>, templateDocument?: FileReference | string) {
    super(templateDocument);
  }

  build(): Application<V, M> {
    const platform = createJitPlatform() as PlatformImpl;

    class ApplicationFromModuleImpl extends Application<V, M> {
      dispose() {
        platform.destroy();
      }
    }

    return new ApplicationFromModuleImpl(platform, <RenderOperation> this.operation, () => platform.compileModule(this.moduleType, []));
  }
}
