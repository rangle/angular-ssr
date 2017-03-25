import {Injector, Type} from '@angular/core';

import {Observable} from 'rxjs/Observable';

// There are three essential concepts that are defined in this file: variant state transitions,
// bootstrappers, and application state readers. Each of these can be one of two things: either
// a class decorated with @Injectable() that accepts some services in its constructor, or a
// function that accepts an Injector and queries the dependency injector itself.

export interface Variant<T> {
  // A set describing all the possible values of this variant. For example if this is
  // a locale variant, this set will contain all languages that the application has
  // translations for.
  values: Array<T> | Set<T>;

  transition?: Type<StateTransition<T>> | StateTransitionFunction<T>;
}

export type VariantsMap = {[variant: string]: Variant<any>};

export interface StateReader {
  getState(): Promise<any> | Observable<any> | any;
}

export type ApplicationStateReaderFunction = (injector: Injector) => Promise<any>;

export type ApplicationStateReader = Type<StateReader> | ApplicationStateReaderFunction;

export interface Bootstrap {
  bootstrap(): Observable<void> | Promise<void> | void;
}

export type ApplicationBootstrapperFunction = (injector: Injector) => Promise<void> | void;

export type ApplicationBootstrapper = Type<Bootstrap> | ApplicationBootstrapperFunction;

export interface StateTransition<T> {
  execute(value: T): Promise<void> | void;
}

export type StateTransitionFunction<T> = (injector: Injector, value: T) => Promise<void> | void;

export type ComposedTransition = (injector: Injector) => void;

// A postprocessor is used to manipulate the DOM prior to completion of serialization. It accepts
// the document object for the application being rendered, and a string representing the rendered
// document. You can either manipulate document using DOM APIs or you can return a string that
// will represent the new version of the rendered document. If you return void, it is assumed that
// you did your processing by manipulating the document object.
export type Postprocessor = (document: Document, html?: string) => void | string;