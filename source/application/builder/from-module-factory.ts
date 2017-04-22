import {NgModuleFactory} from '@angular/core';

import {FileReference} from '../../filesystem';

import {Application} from './application';
import {ApplicationBase} from './application-base';
import {ApplicationBuilderBase} from './builder-base';
import {RenderOperation} from '../operation';
import {ServerPlatform, createJitPlatform} from '../../platform';

export class ApplicationBuilderFromModuleFactory<V> extends ApplicationBuilderBase<any> {
  constructor(private factory: NgModuleFactory<any>, templateDocument?: FileReference | string) {
    super();

    if (templateDocument) {
      this.templateDocument(templateDocument.toString());
    }
  }

  build(): Application<V> {
    const platform = createJitPlatform([]) as ServerPlatform;

    class ApplicationModuleFactory extends ApplicationBase<V, any> {
      dispose() {
        platform.destroy();
      }
    }

    const moduleFactory = Promise.resolve(this.factory);

    return new ApplicationModuleFactory(platform, <RenderOperation> this.operation, moduleFactory);
  }
}
