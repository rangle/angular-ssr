import {RenderOperation, RenderVariantOperation} from './operation';

export const fork = <M, V>(operation: RenderOperation<M, V>): Array<RenderVariantOperation<M, V>> => {
  const operations = new Array<RenderVariantOperation<M, V>>();

  for (const route of operation.routes) {
    if (operation.variants == null ||
        operation.variants.size === 0) {
      operations.push(
        <RenderVariantOperation<M, V>> {
          scope: operation,
          route,
        });
      continue;
    }

    for (const [variant, transition] of Array.from(operation.variants.entries())) {
      operations.push(
        <RenderVariantOperation<M, V>> {
          scope: operation,
          route,
          variant,
          transition,
        });
    }
  }

  return operations;
};