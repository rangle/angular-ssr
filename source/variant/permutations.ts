import {
  NgModuleRef,
  ReflectiveInjector,
  Type
} from '@angular/core';

import {
  Variant,
  VariantSpec
} from './variant';

import {StateTransition} from './transition';

export type ModuleTransition = <M>(moduleRef: NgModuleRef<M>) => Promise<void>;

export interface VariantWithTransformer<V> {
  variant: V;
  transition: ModuleTransition;
}

export const permutations =
    <V>(variants: VariantSpec): Array<VariantWithTransformer<V>> => {
  const options: {[variant: string]: Array<any>} = {};

  for (const k of Object.keys(variants)) {
    options[k] = Array.from(variants[k].values);
  }

  const combinations = recursivePermutations<V>(options);

  return combinations.map(variant => {
    return {
      variant,
      transition: combineTransitions(variants, variant),
    };
  });
};

const combineTransitions = <V>(variants: VariantSpec, values: V): ModuleTransition => {
  const moduleTransition: ModuleTransition =
    <M>(moduleRef: NgModuleRef<M>) => {
      const promises = new Array<Promise<void>>();

      const flattened = Object.keys(variants).map(k => [k, variants[k], values[k]]);

      for (const [key, variant, value] of flattened) {
        try {
          const transitioner = transitionFactory(variant);

          const transitionResult = transitioner(moduleRef, value);

          promises.push(Promise.resolve(transitionResult));
        }
        catch (exception) {
          promises.push(Promise.reject(new Error(errorMessage(key, exception, values))));
        }
      }

      return <Promise<any>> Promise.all<void>(promises);
    };

  return moduleTransition;
};

const recursivePermutations =
    <V>(options: {[key: string]: Array<any>}): Array<V> => {
  const keys = Object.keys(options);

  const state = {};

  const innerRecurse = (index: number) => {
    return options[keys[index]]
      .reduce((p, c) => {
        state[keys[index]] = c;

        if (index + 1 < keys.length) {
          return p.concat(...innerRecurse(index + 1));
        }
        return p.concat(Object.assign({}, state));
      },
      new Array<V>());
  };

  return innerRecurse(0);
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
  return <M>(moduleRef: NgModuleRef<M>, value: T) => {
    const injector = ReflectiveInjector.resolveAndCreate([type]);

    const transitioner = injector.get(type);

    return transitioner.execute(value);
  };
};

const errorMessage = <V>(variant: string, exception: Error, values: V): string => [
  `Failed to instantiate and execute state transition: ${variant}`,
  null,
  'The variants for this state transition are:',
  null,
  JSON.stringify(values, null, 2),
  null,
  'The exception for the original exception is:',
  null,
  exception.stack || '<unknown call stack>'
].map(v => v || String()).join('\n');
