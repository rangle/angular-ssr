import {Injector, ReflectiveInjector, Type} from '@angular/core';

import {Reflector} from 'platform';

import {Variant, VariantDefinitions} from './variant';
import {ComposedTransition, StateTransition} from './transition';
import {TransitionException} from './exception';

export const permutations =
    <V>(variants: VariantDefinitions): Map<V, ComposedTransition> => {
  const options: {[variant: string]: Array<any>} = {};

  for (const k of Object.keys(variants)) {
    options[k] = Array.from(variants[k].values);
  }

  const combinations = recursivePermutations<V>(options);

  const tuples = combinations.map(
    variant => <[V, ComposedTransition]> [variant, combineTransitions(variants, variant)]);

  return new Map(tuples);
};

const combineTransitions = <V>(variants: VariantDefinitions, values: V): ComposedTransition => {
  const transition: ComposedTransition =
    injector => {
      const flattened = Object.keys(variants).map(k => [k, variants[k], values[k]]);

      for (const [key, variant, value] of flattened) {
        try {
          const transitioner = conditionalInstantiate(variant);

          transitioner(injector, value);
        }
        catch (exception) {
          throw new TransitionException(exception, key, values);
        }
      }
    };

  return transition;
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
}

const conditionalInstantiate = <T>(variant: Variant<T>): StateTransition<T> => {
  const annotations = Reflector.annotations(<Type<any>> variant.transition); // injectable?
  if (annotations.length > 0) {
    return instantaiteAndExecute<T>(<Type<any>> variant.transition);
  }
  return <StateTransition<T>> variant.transition;
};

const instantaiteAndExecute = <T>(type: Type<any>): StateTransition<T> => {
  return (injector: Injector, value: T) => {
    const childInjector = ReflectiveInjector.resolveAndCreate([type], injector);

    const transitioner = childInjector.get(type);

    return transitioner.execute(value);
  };
};
