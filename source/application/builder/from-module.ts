import {Type} from '@angular/core';

import {FileReference} from '../../filesystem';

import {Application} from './application';
import {ApplicationBase} from './application-base';
import {ApplicationBuilderBase} from './builder-base';
import {RenderOperation} from '../operation';
import {PlatformImpl, createJitPlatform} from '../../platform';

export class ApplicationBuilderFromModule<V, M> extends ApplicationBuilderBase<V> {
  constructor(private moduleType: Type<M>, templateDocument?: FileReference | string) {
    super(templateDocument);
  }

  build(): Application<V> {
    const platform = createJitPlatform() as PlatformImpl;

    class ApplicationFromModuleImpl extends ApplicationBase<V, M> {
      dispose() {
        platform.destroy();
      }
    }

    const factory = () => platform.compileModule(this.moduleType, []);

    return new ApplicationFromModuleImpl(platform, <RenderOperation> this.operation, factory);
  }
}
