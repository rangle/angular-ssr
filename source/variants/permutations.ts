import {composeTransitions} from './compose';

import {ComposedTransition, VariantsMap} from '../application/contracts';

export const permutations = <V>(variants: VariantsMap): Map<V, ComposedTransition> => {
  const options: {[variant: string]: Array<any>} = {};

  for (const k of Object.keys(variants)) {
    options[k] = Array.from(variants[k].values);
  }

  const combinations = recursivePermutations<V>(options);

  const tuples = combinations.map(
    variant => <[V, ComposedTransition]> [variant, composeTransitions(variants, variant)]);

  return new Map(tuples);
};

const recursivePermutations = <V>(options: {[key: string]: Array<any>}): Array<V> => {
  const keys = Object.keys(options);
  if (keys.length === 0) {
    return new Array<V>();
  }

  const state: V = <V> <any> {};

  const transformer = (index: number) => {
    const reducer = (p: Array<V>, c: V) => {
      state[keys[index]] = c;

      if (index + 1 < keys.length) {
        return p.concat(...transformer(index + 1));
      }

      return p.concat(Object.assign({}, state));
    }

    return options[keys[index]].reduce(reducer, new Array<V>());
  };

  return transformer(0);
};
