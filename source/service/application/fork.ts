import {RenderOperation, RenderVariantOperation} from '../operation';

export const fork = <M, V>(operation: RenderOperation<M, V>): Array<RenderVariantOperation<M, V>> => {
  const operations = new Array<RenderVariantOperation<M, V>>();

  for (const route of operation.routes) {
    for (const [variant, transition] of Array.from(operation.variants.entries())) {
      const suboperation: RenderVariantOperation<M, V> = {
        scope: operation,
        route,
        variant,
        transition,
      };

      operations.push(suboperation);
    }
  }

  return operations;
};