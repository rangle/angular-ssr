import {
  Injector,
  ReflectiveInjector,
  Type
} from '@angular/core';

import {
  Variant,
  VariantDefinitions,
  ComposedTransition
} from './contracts';

import {StateTransition} from './transition';

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
      const promises = new Array<Promise<void>>();

      const flattened = Object.keys(variants).map(k => [k, variants[k], values[k]]);

      for (const [key, variant, value] of flattened) {
        try {
          const transitioner = transitionFactory(variant);

          const transitionResult = transitioner(injector, value);

          promises.push(Promise.resolve(transitionResult));
        }
        catch (exception) {
          promises.push(Promise.reject(new Error(errorMessage(key, exception, values))));
        }
      }

      return <Promise<any>> Promise.all<void>(promises);
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

const transitionFactory = <T>(variant: Variant<T>): StateTransition<T> => {
  if (variant.useClass) {
    return instantiateTransitionClass<T>(variant.useClass);
  }
  else if (variant.useFunction) {
    return variant.useFunction;
  }
  else {
    throw new Error('Variant must provide one of useClass or useFunction');
  }
};

const instantiateTransitionClass = <T>(type: Type<any>): StateTransition<T> => {
  return (injector: Injector, value: T) => {
    const childInjector = ReflectiveInjector.resolveAndCreate([type], injector);

    const transitioner = childInjector.get(type);

    return transitioner.execute(value);
  };
};

const errorMessage = <V>(variant: string, exception: Error, values: V): string => [
  `Failed to instantiate and execute state transition: ${variant}`,
  null,
  'The variant options for this state transition are:',
  null,
  JSON.stringify(values, null, 2),
  null,
  'The exception for the original exception is:',
  null,
  exception.stack || '<unknown call stack>'
].map(v => v || String()).join('\n');
