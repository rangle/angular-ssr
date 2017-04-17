import {Type} from '@angular/core';

import {FileReference} from '../../filesystem';

import {Application} from './application';
import {ApplicationBase} from './application-base';
import {ApplicationBuilderBase} from './builder-base';
import {RenderOperation} from '../operation';
import {ServerPlatform, createJitPlatform} from '../../platform';

export class ApplicationBuilderFromModule<V, M> extends ApplicationBuilderBase<V> {
  constructor(private moduleType: Type<M>, templateDocument?: FileReference | string) {
    super(templateDocument);
  }

  build(): Application<V> {
    const platform = createJitPlatform() as ServerPlatform;

    class ApplicationFromModule extends ApplicationBase<V, M> {
      dispose() {
        platform.destroy();
      }
    }

    const promise = platform.compileModule(this.moduleType);

    return new ApplicationFromModule(platform, <RenderOperation> this.operation, () => promise);
  }
}
