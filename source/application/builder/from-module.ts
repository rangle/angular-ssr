import {Type} from '@angular/core';

import {Application} from './application';
import {ApplicationBuilder} from './builder';
import {ApplicationImpl, ApplicationBuilderImpl} from './impl';
import {RenderOperation} from '../operation';
import {ServerPlatform, createJitPlatform} from '../../platform';

export const applicationBuilderFromModule = <V = {}>(moduleType: Type<any>, templateDocument?: string): ApplicationBuilder<V> => {
  let platform: ServerPlatform = null;

  const dispose = async () => {
    if (platform) {
      await platform.destroy();
    }
  }

  const build = (operation: RenderOperation): Application<V> => {
    platform = createJitPlatform() as ServerPlatform;

    const promise = platform.compileModule(moduleType);

    return new ApplicationImpl(platform, operation, promise, undefined, dispose);
  }

  return new ApplicationBuilderImpl(build, dispose, templateDocument);
};
