import {Injector, ReflectiveInjector, Type} from '@angular/core';

import {Reflector} from '../platform';

import {TransitionException} from '../exception';

import {
  ComposedTransition,
  StateTransition,
  StateTransitionFunction,
  Variant,
  VariantsMap
} from '../application/contracts';

export const composeTransitions = <V>(variants: VariantsMap, values: V): ComposedTransition => {
  const transition: ComposedTransition =
    injector => {
      const flattened = Object.keys(variants || {}).map(k => [k, variants[k], values[k]]);

      for (const [key, variant, value] of flattened) {
        try {
          const transitioner = transitionToFunction(variant);

          transitioner(injector, value);
        }
        catch (exception) {
          throw new TransitionException(formatException(key, values, exception), exception);
        }
      }
    };

  return transition;
};

const transitionToFunction = <T>(variant: Variant<T>): StateTransitionFunction<T> => {
  const annotations = Reflector.annotations(<Type<any>> variant.transition); // injectable?
  if (annotations.length > 0) {
    return instantiator(<Type<StateTransition<T>>> variant.transition);
  }
  return variant.transition as StateTransitionFunction<T>;
};

const instantiator = <T>(type: Type<StateTransition<T>>): StateTransitionFunction<T> => {
  return (injector: Injector, value: T) => {
    const descendantInjector = ReflectiveInjector.resolveAndCreate([type], injector);
    const transition = descendantInjector.get(type);
    return transition.execute(value);
  };
};

const stringify = object => JSON.stringify(object, null, 2);

const formatException = (key: string, values, exception: Error) =>
  `Variant transition exception: ${key} (variants: ${stringify(values)}): ${exception.toString()}`;
