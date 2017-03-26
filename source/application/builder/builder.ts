import {PlatformRef} from '@angular/core';

import {ApplicationBootstrapper, ApplicationStateReader, Postprocessor, VariantsMap} from '../contracts';
import {Disposable} from '../../disposable';
import {Route} from './../../route/route';

export interface ApplicationBuilder extends Disposable {
  readonly platform: PlatformRef;

  // Provide a template HTML document that will be used when rendering this application.
  // In almost all cases this will be the build output file `dist/index.html`, not the
  // source index.html. This is because this file should include everything that is necessary
  // to boot the client-side application, including the <script> tags that are injected
  // by webpack as part of the build process.
  templateDocument(template?: string): string;

  // Provide optional bootstrap classes or functions. If you provide a class type, that type
  // will be instantiated by the dependency injector in the context of a running application.
  // If you provide a function, we will call the function with an application di injector.
  // Bootstrap methods should be specialized things that you only have to bootstrap on the
  // server. Generic bootstrap or initialization code belongs in the application code, not
  // in the server.
  bootstrap(bootstrapper: ApplicationBootstrapper): Array<ApplicationBootstrapper>;

  // Define the variants of this application. For applications that wish to render different
  // variants such as languages or anonymous vs authenticated, you can define those variants
  // here and then query for rendered documents using {@link DocumentVariantStore}
  variants(definitions?: VariantsMap): void;

  // Provide an optional array of routes that you wish to pre-render. If you do not specify
  // these, angular-ssr will query the router for all routes defined in the application, and
  // then filter out routes which accept parameters (like /foo/:bar)
  routes(routes?: Array<Route>): Array<Route>;

  // Provide an optional state reader function which can query application services or ngrx
  // and return that state to the client, so that it will be available in a global variable
  // called bootstrapApplicationState. This is how you do state transfer in angular-ssr.
  stateReader<R>(stateReader?: ApplicationStateReader<R>): ApplicationStateReader<R>;

  // Apply optional postprocessing of rendered documents. For example, perhaps your index.html
  // has some kind of placeholder which you wish to replace with some code or text. These
  // postprocessing functions will be called in order and each successive transform will receive
  // as its argument the result of the prior postprocessor.
  postprocess(transform?: Postprocessor): Array<Postprocessor>;
}