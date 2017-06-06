import {
  ApplicationBootstrapper,
  ApplicationStateReader,
  Postprocessor,
  VariantsMap
} from '../contracts';

import {Application} from './application';

import {PrebootConfiguration} from '../preboot';

import {Route} from '../../route/route';

export interface ApplicationBuilder<V> {
  // Construct an application from this builder after configuring it
  build(): Application<V>;

  // Provide a template HTML document that will be used when rendering this application.
  // In almost all cases this will be the build output file `dist/index.html`, not the
  // source index.html. This is because this file should include everything that is necessary
  // to boot the client-side application, including the <script> tags that are injected
  // by webpack as part of the build process.
  templateDocument(template?: string): string | undefined;

  // Provide optional bootstrap classes or functions. If you provide a class type, that type
  // will be instantiated by the dependency injector in the context of a running application.
  // If you provide a function, we will call the function with an application di injector.
  // Bootstrap methods should be specialized things that you only have to bootstrap on the
  // server. Generic bootstrap or initialization code belongs in the application code, not
  // in the server.
  bootstrap(bootstrapper: ApplicationBootstrapper): void;

  // Define the variants of this application. For applications that wish to render different
  // variants such as languages or anonymous vs authenticated, you can define those variants
  // here and then query for rendered documents using {@link MemoryVariantCache}
  variants(definitions?: VariantsMap): void;

  // Provide an optional array of routes that you wish to pre-render. If you do not specify
  // these, angular-ssr will query the router for all routes defined in the application, and
  // then filter out routes which accept parameters (like /foo/:bar)
  routes(routes?: Array<Route>): void;

  // Provide an optional state reader function which can query application services or ngrx
  // and return that state to the client, so that it will be available in a global variable
  // called bootstrapApplicationState. This is how you do state transfer in angular-ssr.
  stateReader<R>(stateReader?: ApplicationStateReader<R>): void;

  // Apply optional postprocessing of rendered documents. For example, perhaps your index.html
  // has some kind of placeholder which you wish to replace with some code or text. These
  // postprocessing functions will be called in order and each successive transform will receive
  // as its argument the result of the prior postprocessor.
  postprocess(transform?: Postprocessor): void;

  // Enable preboot integration and specify options that will be passed to preboot when the
  // inline code is generated and injected into the document. If you just specify true,
  // then we will automatically look up the root element tags based on the components that
  // your application bootstraps.
  preboot(preboot?: PrebootConfiguration | boolean): void;

  // Configure how long we will wait for the application to stabilize itself before assuming it
  // never will stabilize and failing the render operation. For build-time rendering, this can
  // be a comfortably high number. For on-demand rendering, you should set this very low so
  // that you can catch performance problems. To completely disable, call it and specify zero
  // milliseconds as the timeout argument (builder.stabilizeTimeout(0)). This may cause render
  // operations to hang indefinitely if your application has macrotasks or microtasks that
  // do not complete (eg setInterval).
  stabilizeTimeout(milliseconds?: number): number | null
}