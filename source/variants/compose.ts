import {Injector} from '@angular/core';

import {ComposedTransition, Variant, VariantsMap} from '../application/contracts';

import {RuntimeException} from '../exception';

import {typeToInjectorFunction} from '../transformation';

export const composeTransitions = <V>(variants: VariantsMap, values: V): ComposedTransition => {
  return (injector: Injector): Promise<void> => {
    if (variants == null || Object.keys(variants).length === 0) {
      return Promise.resolve();
    }

    const promises = new Array<Promise<void>>();

    for (const [, v, value] of Object.keys(variants).map(k => [k, variants[k], values[k]])) {
      const variant: Variant<V> = v;

      if (value == null) {
        // If there is no value provided for this variant, and if null or undefined is not
        // explicitly listed in the variant values, then we will just skip this transition
        // altogether. If you don't want this behaviour, then either add null or undefined
        // to the set of permissible variant values, or always provide values for each variant
        // when you call renderUri and so forth.
        if (new Set(variant.values).has(value) === false) {
          continue;
        }
      }

      const fn = typeToInjectorFunction(variant.transition, t => t.transition(value));

      promises.push(
        Promise.resolve(fn(injector, value))
          .catch(exception => Promise.reject(new RuntimeException(`Transition failed: ${variant.transition.name}: ${value}`, exception))));
    }

    return Promise.all(promises) as Promise<any>;
  };
};
