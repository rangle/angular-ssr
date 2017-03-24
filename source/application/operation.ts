import {NgModuleFactory} from '@angular/core';

import {ApplicationBootstrapper, ApplicationStateReader} from './contracts';
import {ComposedTransition, VariantsMap} from './contracts';
import {Route} from '../route';

export interface RenderOperation<M> {
  // This is an HTML document containing the index.html build output of the application.
  // We inject the rendered content into this document, but it must still contain <script>
  // tags so that it will boot the client application after rendering the prerendered
  // HTML returned from the first HTTP request.
  templateDocument: string;

  // A precompiled NgModuleFactory<M> which can be used to instantiate applications
  moduleFactory: NgModuleFactory<M>;

  // An optional array of routes to render concurrently
  routes: Array<Route>;

  // An optional map of variants that describe the different states and request options
  // that we will render. Be careful because the space complexity of storing variants
  // is O(n!) so you should only have a few different variants of your application.
  // A good example of a variant might be an authenticated / anonymous boolean. You
  // would render each route separately and the variant transition function would call
  // some application service to place the application into an authenticated or anonymous
  // state. (This transition class would be part of your server code, not application code.
  // See the documentation in the readme and the definition of StateTransition<T> contract)
  variants: VariantsMap;

  // An optional state reader (either a function accepting an application injector, or a class
  // implementing the StateReader<T> contract). If you provide a class decorated with
  // @Injectable, we will instantiate the class in the context of the running application,
  // so it has access to all providers and services in the application. If it is not decorated,
  // it must be a function that just accepts a reference to the Injector instance itself,
  // which it can use to query services and providers.
  stateReader: ApplicationStateReader;

  // Optional function to execute during application initialization.
  bootstrappers: Array<ApplicationBootstrapper>;

  // A chain of postprocessors that transform rendered HTML documents in some way. They will
  // be executed in order of definition, and each transform will receive as its argument the
  // results of the previous transformation.
  postprocessors: Array<(html: string) => string>;
}

export interface RenderVariantOperation<M, V> {
  scope: RenderOperation<M>;       /// parent render scope
  uri: string;                     /// an absolute URI including protocol and hostname
  variant?: V;                     /// variant options for this render operation
  transition?: ComposedTransition; /// variant transition function composed from {@link VariantMap} and {@link variant}
}