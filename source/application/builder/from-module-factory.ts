import {NgModuleFactory} from '@angular/core';

import {FileReference} from '../../filesystem';

import {Application} from './application';
import {ApplicationBuilderBase} from './builder-base';
import {RenderOperation} from '../operation';
import {PlatformImpl, createJitPlatform} from '../../platform';

export class ApplicationBuilderFromModuleFactory<V> extends ApplicationBuilderBase<any> {
  constructor(private factory: NgModuleFactory<any>, templateDocument?: FileReference | string) {
    super();

    if (templateDocument) {
      this.templateDocument(templateDocument.toString());
    }
  }

  build(): Application<V, any> {
    const platform = createJitPlatform([]) as PlatformImpl;

    class ApplicationFromModuleFactoryImpl extends Application<V, any> {
      dispose() {
        platform.destroy();
      }
    }

    const moduleFactory = () => Promise.resolve(this.factory);

    return new ApplicationFromModuleFactoryImpl(platform, <RenderOperation> this.operation, moduleFactory);
  }
}
