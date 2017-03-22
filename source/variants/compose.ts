import {Injector, ReflectiveInjector, Type} from '@angular/core';

import {Reflector} from '../platform';
import {ComposedTransition, StateTransitionFunction} from './transition';
import {Variant, VariantDefinitions} from './variant';
import {TransitionException} from '../exception';

export const composeTransitions = <V>(variants: VariantDefinitions, values: V): ComposedTransition => {
  const transition: ComposedTransition =
    injector => {
      const flattened = Object.keys(variants).map(k => [k, variants[k], values[k]]);

      for (const [key, variant, value] of flattened) {
        try {
          const transitioner = conditionalInstantiate(variant);

          transitioner(injector, value);
        }
        catch (exception) {
          throw new TransitionException(formatException(key, values, exception), exception);
        }
      }
    };

  return transition;
};

const conditionalInstantiate = <T>(variant: Variant<T>): StateTransitionFunction<T> => {
  const annotations = Reflector.annotations(<Type<any>> variant.transition); // injectable?
  if (annotations.length > 0) {
    return instantaiteAndExecute<T>(<Type<any>> variant.transition);
  }
  return <StateTransitionFunction<T>> variant.transition;
};

const instantaiteAndExecute = <T>(type: Type<any>): StateTransitionFunction<T> => {
  return (injector: Injector, value: T) => {
    const childInjector = ReflectiveInjector.resolveAndCreate([type], injector);

    const transitioner = childInjector.get(type);

    return transitioner.execute(value);
  };
};

const stringify = object => JSON.stringify(object, null, 2);

const formatException = (key: string, values, exception: Error) =>
  `Variant transition exception: ${key} (variants: ${stringify(values)}): ${exception.toString()}`;
