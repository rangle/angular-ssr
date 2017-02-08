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

export const renderVariant = async <M, V>(operation: RenderVariantOperation<M, V>): Promise<RenderDocument<V>> => {
  const {parentOperation} = operation;

  const platform = acquirePlatform();
  try {
    const moduleWrapper = moduleWrap(operation);

    const moduleRef = await platform.bootstrapModule(moduleWrapper);
    try {
      await navigateRoute(moduleRef, operation.route);

      const document = await snapshot<M, V>(moduleRef, operation);

      return {variant: operation.transformer.variant, document};
    }
    finally {
      moduleRef.destroy();
    }
  }
  catch (exception) {
    return {variant: operation.transformer.variant, exception};
  }
  finally {
    platform.destroy();
  }
};