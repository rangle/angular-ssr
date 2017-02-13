import {Snapshot, snapshot} from '../snapshot';

import {RenderVariantOperation} from '../operation';

import {
  acquirePlatform,
  browserModuleToServerModule,
} from 'platform';

export const renderVariant = async <M, V>(operation: RenderVariantOperation<M, V>): Promise<Snapshot<V>> => {
  const platform = acquirePlatform();

  try {
    const {transition, scope: {moduleType}} = operation;

    const wrapper = browserModuleToServerModule(moduleType, transition);

    const moduleRef = await platform.bootstrapModule<M>(wrapper);

    try {
      return await snapshot(moduleRef, operation.variant);
    }
    finally {
      moduleRef.destroy();
    }
  }
  finally {
    platform.destroy();
  }
};