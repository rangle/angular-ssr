import {Type} from '@angular/core';

import {
  StateTransition,
  StateTransitionFunction,
} from './transition';

export interface Variant<T> {
  // A set describing all the possible values of this variant. For example if this is
  // a locale variant, this set will contain all languages that the application has
  // translations for.
  values: Array<T> | Set<T>;

  // A transition can be one of two things: either an Injectable class or a function that accepts
  // a dependency injection container.
  //
  // 1. An @Injectable() class which will be instantiated with all of its dependencies resolved,
  // and will then be used to transition the state of the target application in some specific
  // way. This class can take any number of constructor arguments which will be resolved in
  // the context of the executing application, in the context of the app injector. This means
  // that you can request any entity that has been registered with your application's dependency
  // injector system. The class must then take those service instances and and transition the
  // application into the state described by this variant. For example, if this variant is used
  // to change locale settings, then the purpose of this transition would be to select a new
  // locale in the running application. The specific language to select would be provided as an
  // argument to StateTransitionContract<T>::execute. Note that this variant will be combined
  // with all permutations of all other variants, so it should be kept simple and understandable.
  // Avoid doing anything other than setting the specific state described by this variant. Your
  // transition handler should be one or two lines of code. If you are using @ngrx this class
  // should really just dispatch an action or two, for example.
  //
  // 2. A simple function that takes as its argument an NgModuleRef<M> and a variant value and
  // performs the transition itself. It may request values from the dependency injector manually,
  // using {@link NgModuleRef.injector}. This is an alternative to using the useClass construct.
  transition?: Type<StateTransition<T>> | StateTransitionFunction<T>;
}

export type VariantsMap = {[variant: string]: Variant<any>};