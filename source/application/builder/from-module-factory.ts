import {NgModuleFactory} from '@angular/core';

import {Application} from './application';
import {ApplicationBuilder} from './builder';
import {ApplicationImpl, ApplicationBuilderImpl} from './impl';
import {RenderOperation} from '../operation';
import {ServerPlatform, createJitPlatform} from '../../platform';

export const applicationBuilderFromModuleFactory = <V = {}>(factory: NgModuleFactory<any>, templateDocument?: string): ApplicationBuilder<V> => {
  let platform: ServerPlatform = null;

  const dispose = async () => {
    if (platform) {
      await platform.destroy();
    }
  }

  const build = (operation: RenderOperation): Application<V> => {
    platform = createJitPlatform([]) as ServerPlatform;

    return new ApplicationImpl(platform, operation, Promise.resolve(factory), undefined, dispose);
  }

  return new ApplicationBuilderImpl(build, dispose, templateDocument);
};
