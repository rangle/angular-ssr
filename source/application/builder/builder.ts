import {Injector} from '@angular/core';

import {ApplicationStateReader} from '../operation';
import {Disposable} from '../../disposable';
import {Route} from './../../route/route';
import {VariantDefinitions} from '../../variants';

export interface ApplicationBuilder extends Disposable {
  // Provide a template HTML document that will be used when rendering this application.
  // In almost all cases this will be the build output file `dist/index.html`, not the
  // source index.html. This is because this file should include everything that is necessary
  // to boot the client-side application, including the <script> tags that are injected
  // by webpack as part of the build process.
  templateDocument(template: string): ApplicationBuilder;

  // Provide optional bootstrap functions that have access to the application root injector.
  // You can query this injector for whatever services you need in order to apply your
  // special server-side bootstrapping. Bootstrap code that is common to both server and
  // client should be placed elsewhere, in a @Component or an @NgModule.
  bootstrap(fn: (injector: Injector) => void): ApplicationBuilder;

  // Define the variants of this application. For applications that wish to render different
  // variants such as languages or anonymous vs authenticated, you can define those variants
  // here and then query for rendered documents using {@link DocumentVariantStore}
  variants(definitions: VariantDefinitions): ApplicationBuilder;

  // Provide an optional array of routes that you wish to pre-render. If you do not specify
  // these, angular-ssr will query the router for all routes defined in the application, and
  // then filter out routes which accept parameters (like /foo/:bar)
  routes(routes: Array<Route>): ApplicationBuilder;

  // Provide an optional state reader function which can query application services or ngrx
  // and return that state to the client, so that it will be available in a global variable
  // called bootstrapApplicationState. This is how you do state transfer in angular-ssr.
  stateReader(stateReader: ApplicationStateReader): ApplicationBuilder;

  // Apply optional postprocessing of rendered documents. For example, perhaps your index.html
  // has some kind of placeholder which you wish to replace with some code or text. These
  // postprocessing functions will be called in order and each successive transform will receive
  // as its argument the result of the prior postprocessor.
  postprocess(transform: (html: string) => string): ApplicationBuilder;
}