import {Injector, Type} from '@angular/core';

// There are three essential concepts that are defined in this file: variants, bootstrappers,
// and application state readers. Each of these can be one of two things: either a class
// decorated with @Injectable() that accepts some application services in its constructor, or
// a function that accepts an Injector and queries the dependency injector itself. If it is
// a class definition, that class will be instantiated in the context of a running application.
// Likewise if it is a function, it will be executed and given the root dependency Injector
// which you can use to query the application for the services you need.

export interface Variant<T> {
  // A set describing all the possible values of this variant. For example if this is
  // a locale variant, this set will contain all languages that the application has
  // translations for.
  values: Array<T> | Set<T>;

  transition?: Type<StateTransition<T>> | StateTransitionFunction<T>;
}

export type VariantsMap = {[variant: string]: Variant<any>};

// A StateReader<T> is used to extract state from the application, and that state is then
// injected into the rendered document so that the client application has access to it.
export interface StateReader<State> {
  getState(): State | Promise<State>;
}

export type ApplicationStateReaderFunction<R> = (injector: Injector) => Promise<any>;

export type ApplicationStateReader<R> = Type<StateReader<R>> | ApplicationStateReaderFunction<R>;

// A bootstrap function is executed after the root module is instantiated and before rendering.
export interface Bootstrap {
  bootstrap(): Promise<void> | void;
}

export type ApplicationBootstrapperFunction = (injector: Injector) => Promise<void> | void;

export type ApplicationBootstrapper = Type<Bootstrap> | ApplicationBootstrapperFunction;

// A StateTransition is a class that uses the dependency injector to request application services
// and then places the application in the state described by the value provided to transition().
// These are used to compose application variants. So for example several state transitions may
// be composed together into a ComposedTransition and then that transition is run at application
// bootstrap, as part of the rendering process.
export interface StateTransition<T> {
  transition(value: T): Promise<void> | void;
}

export type StateTransitionFunction<T> = (injector: Injector, value: T) => Promise<void> | void;

export type ComposedTransition = (injector: Injector) => Promise<void>;

// A postprocessor is used to manipulate the DOM prior to completion of serialization. It accepts
// the document object for the application being rendered, and a string representing the rendered
// document. You can either manipulate document using DOM APIs or you can return a string that
// will represent the new version of the rendered document. If you return void, it is assumed that
// you did your processing by manipulating the document object.
export type Postprocessor = (document: Document, html?: string) => void | string;

export interface EventSelector {
  selector: string;
  events: Array<string>;
  keyCodes?: Array<number>;
  preventDefault?: boolean;
  freeze?: boolean;
  action?: (node: Node, event: Event) => void;
  noReplay?: boolean;
}

export type PrebootApplicationRoot = {appRoot: string | Array<string>};

export type PrebootSeparateRoots = {serverClientRoot: Array<{clientSelector: string, serverSelector: string}>};

export type PrebootRoot = PrebootApplicationRoot | PrebootSeparateRoots;

export type PrebootConfiguration = PrebootRoot & {
  eventSelectors?: Array<EventSelector>;
  buffer?: boolean;
  uglify?: boolean;
  noInlineCache?: boolean;
};
