import {Type} from '@angular/core';

import {StateTransition} from './transition';

export interface Variant<T> {
  // An @Injectable() class which will be used to transition the state of the target
  // application. This class can take any number of injectable arguments which will be
  // resolved by the executing application. The class must then take those service
  // instances and  and place the application into the state described by this variant.
  // For example, if this variant is used to change locale settings, then the purpose
  // of this state manipulator class would be to select a new locale in a running
  // application. The specific language to select would be provided as an argument to
  // StateManipulator<T>::execute. Note that this variant will be combined with all
  // permutations of all other variants, so it should be kept simple and understandable.
  // If you are using @ngrx this class should really just dispatch an action or two. 
  transitionClass: Type<StateTransition<T>>;

  // A set describing all the possible values of this variant. For example if this is
  // a locale variant, this set will contain all languages that the application has
  // translations for.
  values: Array<T> | Set<T>;
}