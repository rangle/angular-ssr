import {
  ComposedTransition,
  Variant,
  VariantsMap,
} from '../application/contracts';

import {typeToInjectorFunction} from '../transformation';

export const composeTransitions = <V>(variants: VariantsMap, values: V): ComposedTransition => {
  return (injector) => {
    if (variants == null || Object.keys(variants).length === 0) {
      return Promise.resolve();
    }

    const promises = new Array<Promise<void>>();

    for (const [, v, value] of Object.keys(variants).map(k => [k, variants[k], values[k]])) {
      const variant: Variant<V> = v;

      const fn = typeToInjectorFunction(variant.transition, t => t.execute(value));

      promises.push(Promise.resolve(fn(injector, value)));
    }

    return <Promise<any>> Promise.all(promises);
  };
};
