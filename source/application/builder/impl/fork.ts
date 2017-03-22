import {RenderOperation, RenderVariantOperation} from '../../operation';

import {permutations} from '../../../variants/permutations';

import {routeToUri} from '../../../route/transform';

export const fork = <M, V>(operation: RenderOperation<M>): Array<RenderVariantOperation<M, V>> => {
  const operations = new Array<RenderVariantOperation<M, V>>();

  for (const route of operation.routes) {
    if (operation.variants == null || Object.keys(operation.variants).length === 0) {
      operations.push(
        <RenderVariantOperation<M, V>> {
          scope: operation,
          uri: routeToUri(route),
        });
      continue;
    }

    const variants = permutations<V>(operation.variants);

    for (const [variant, transition] of Array.from(variants.entries())) {
      operations.push(
        <RenderVariantOperation<M, V>> {
          scope: operation,
          uri: routeToUri(route),
          variant,
          transition,
        });
    }
  }

  return operations;
};