import {
  RenderVariantOperation,
  RenderDocument,
  RenderRoute,
} from './types';

import {VariantWithTransformer} from '../variant';

import {acquirePlatform} from '../platform';

import {moduleWrap} from './module';
import {navigateRoute} from './navigate';
import {snapshot} from './snapshot';

export const bootstrap = async <M, V>(operation: RenderVariantOperation<M, V>): Promise<RenderDocument<V>> => {
  const {parentOperation} = operation;

  const platform = acquirePlatform();
  try {
    const moduleWrapper = moduleWrap(operation);

    const moduleRef = await platform.bootstrapModule(moduleWrapper);
    try {
      await navigateRoute(moduleRef, operation.route);

      const document = await snapshot<M, V>(moduleRef, operation);

      return {variant: operation.transform.variant, document};
    }
    finally {
      moduleRef.destroy();
    }
  }
  finally {
    platform.destroy();
  }
};