import {Type} from '@angular/core';

import {Observable} from 'rxjs';

import {
  acquirePlatform,
  browserModuleToServerModule,
} from 'platform';

import {snapshot} from 'renderer';

import {RenderVariantOperation} from '../operation';

export const run = async <M, V>(operation: RenderVariantOperation<M, V>): Promise<string> => {
  const platform = acquirePlatform();
  try {
    const {transition, scope: {moduleType}} = operation;

    const wrapper = browserModuleToServerModule(moduleType, transition);

    const moduleRef = await platform.bootstrapModule<M>(wrapper);
    try {
      return await snapshot<M>(moduleRef);
    }
    finally {
      moduleRef.destroy();
    }
  }
  finally {
    platform.destroy();
  }
};
