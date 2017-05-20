[![CircleCI](https://img.shields.io/circleci/project/github/clbond/angular-ssr.svg)](https://circleci.com/gh/clbond/angular-ssr)
[![Coverage Status](https://coveralls.io/repos/github/clbond/angular-ssr/badge.svg)](https://coveralls.io/github/clbond/angular-ssr)
[![npm](https://img.shields.io/npm/v/angular-ssr.svg)](https://www.npmjs.com/package/angular-ssr)

# Advanced server-side rendering for Angular 4+ applications

- [x] Exposes a complete DOM implementation to your application and therefore works with `@angular/material`, [bootstrap](http://getbootstrap.com/css/), [jQuery](https://jquery.com/)
- [x] Broad compatibility with just about any third-party libraries you are using (including direct DOM manipulation)
- [x] On-demand rendering through NodeJS server
- [x] Single-command build-time rendering (`ng-render`)
- [x] Extremely fast: well written applications can be rendered on demand and served in under 100ms
- [x] Completely solves the issue of loading a page with nothing but a loading animation inside of it
- [x] Render your entire application on the server and return an immediately renderable document as part of the very first HTTP request, instantly
- [x] Seamless [preboot](https://github.com/angular/preboot) integration

- [Advanced server-side rendering for Angular 4+ applications](#advanced-server-side-rendering-for-angular-4-applications)
- [Introduction](#introduction)
- [The simplest possible case: an application with no built-in HTTP server and no need for on-demand rendering](#the-simplest-possible-case-an-application-with-no-built-in-http-server-and-no-need-for-on-demand-rendering)
  - [Additional examples](#additional-examples)
- [Use cases](#use-cases)
  - [On-demand server-side rendering and caching](#on-demand-server-side-rendering-and-caching)
    - [Prerendering](#prerendering)
    - [Caching](#caching)
  - [Single-use server-side rendering as part of a build process](#single-use-server-side-rendering-as-part-of-a-build-process)
  - [preboot](#preboot)
  - [Variants](#variants)
    - [Client code](#client-code)
    - [Server code](#server-code)
- [APIs](#apis)
  - [State transfer from server to client](#state-transfer-from-server-to-client)
  - [`Snapshot<V>`](#snapshotv)
  - [Very simple (example) caching implementations](#very-simple-example-caching-implementations)
- [Zone stability issues](#zone-stability-issues)
- [Example projects](#example-projects)
  - [CLI based project that uses `@angular/material`](#cli-based-project-that-uses-angularmaterial)
  - [On-demand rendering using express](#on-demand-rendering-using-express)
  - [On-demand rendering using koa](#on-demand-rendering-using-koa)
- [FAQ](#faq)
- [Comments, queries, or rants](#comments-queries-or-rants)

# Introduction

The purpose of this library is to support server-side rendering of your Angular 4+ applications with minimal code changes and mimimal difficulty. It supports both Angular CLI projects and projects that use custom webpack configurations. It works out of the box with `@angular/material` with no hot-fixes or workarounds! It also generally requires **zero** changes to your existing application code: you won't have to create separate `@NgModule`s, one for the server-side rendered application and one for the regular client application (unless you want to). You can just take your Angular code as-is and follow the steps below to get server-side rendering working.

There are two ways you can use `angular-ssr`:
1. If you want to generate prerendered documents as part of your application build, run a normal `ng build`, and then invoke `ng-render` from `node_modules/.bin`. I should emphasize that this is the simplest use of angular-ssr, but also the least flexible and the most prone to errors. So if you encounter exceptions because you have some unsual configs or webpack settings, please try one of the other options below. But if you are using `ng-render`, it will result in several steps being taken:
	* It will use `tsconfig.json`, `webpack.server.config.js` or `webpack.config.js` and some other configuration elements to compile your application to a temporary directory and load the resulting JavaScript code into memory.
	* It will query your router configuration and collect all your application routes into a flattened array (eg. `/`, `/foo`, `/bar`)
		* Note that your application should not be using the hash location strategy if you wish to do server-side rendering. Otherwise this will generate a directory structure containing `#` as part of the path and this is probably not what you want. Just use the regular location strategy instead of `useHash` or `HashLocationStrategy`.
	* For each of the discovered routes, it will instantiate your application and render that route to a static `.html` file in `dist` (or, if you specified an alternate output directory using `--output`, it will write the files there). It instantiates the application using the existing `dist/index.html` file that was produced as part of your normal application build as a template. The pre-rendered content will be inserted into that template and written out as a new `.html` file based on the route: e.g., `/foo/index.html`.
	* The drawback to this approach is that the content is generated at build time, **so if your routes contain some dynamic data that needs to be rendered on the server**, you will instead need to [write a simple HTTP server using express or koa and do on-demand server-side rendering](#on-demand-server-side-rendering-and-caching).
2. If you need to do on-demand rendering (using the API) instead of build-time rendering (using `ng-render`) because your application contains a lot of dynamic data or due to some other constraint, no problem. It just means that you will have to build a separate webpack program output: either a NodeJS HTTP server, or a NodeJS application whose sole purpose is to do prerendering. You will follow these rough steps:
	* Install `angular-ssr` as a dependency: `npm install angular-ssr --save`
	* If you already have multiple webpack configs (one for server and one for client), then you can skip down to the next section and begin writing code to interface with `angular-ssr`.
	* Otherwise, you will need to add an additional output to your existing webpack configurations. This can take two forms: either you modify your existing `webpack.config.js` and just add an additional output, or you create an entirely new `webpack-server.config.js` which will serve as your SSR webpack configuration. Regardless of how you accomplish it, you will ultimately need to produce two programs from webpack:
		* Your normal client-side JavaScript application
		* An additional server-side application that you will use to do server-side rendering. You have a couple choices here, as well:
			* If you want your application to use a NodeJS application with an HTTP server inside of it that will do on-demand pre-rendering of your application routes, then do that. We can then write a few lines of code to do the actual pre-rendering / caching inside of your route handlers. It doesn't matter if you use koa or express or any other HTTP server you wish to use -- 	`angular-ssr` will not integrate directly with the HTTP server anyway. It just exposes a very simple API to get pre-rendered HTML documents, and you can integrate this with your server in whichever way makes the most sense for your application.
			* Alternatively, you can build an application whose sole purpose is to do server-side rendering at build-time. This application will produce some static pre-rendered application content and then exit. This use-case makes sense if your application will not need to do *on-demand* server-side rendering. Let's say for example you just have an application with a few routes (`/a`, `/b`, `/c`, etc.). In this case, since all routes are known in advance and none of them take any URL parameters, we can just pre-render each route at build time and spit out some `.html` files.
			* Let's say that your application **does** need on-demand rendering, though. For example, you are writing a blog application that has URLs like `/blog/post/1`, `/blog/user/3`, etc. In this case, you will need to do on-demand server-side rendering. No problem! Write a small HTTP server using express (or koa). Then from inside your server, you can demand render (and optionally cache, with a short TTL) particular routes like `/blog/post/1`. I will show you some examples of how to do this below.

# The simplest possible case: an application with no built-in HTTP server and no need for on-demand rendering

If it makes sense for you to render your application at build time as a performance optimization (ie., your application does not contain lots of dynamic content that is not available at build time, or which is subject to change after the build), then the `ng-render` CLI tool is probably what you want. You simply run `ng build` or `npm run build` as normal, and then invoke `./node_modules/.bin/ng-render` (after `npm install angular-ssr --save` of course). This will render your application routes into static `.html` files. It is worth emphasizing that this use case is the easiest, but also the least flexible. If you need on-demand rendering, or if you have custom webpack configurations, then you should skip down to the examples below as they will cover your use-case better than this section.

To give `ng-render` a shot, just do:

```sh
npm install angular-ssr --save
ng build
./node_modules/.bin/ng-render
```

It should spit out some messages like:

```
[info] Writing rendered route / to /Users/bond/proj/dist/index.html
[info] Writing rendered route /foo to /Users/bond/proj/dist/foo/index.html
[info] Writing rendered route /bar to /Users/bond/proj/dist/bar/index.html
```

You can then do `cd dist` and run:

```sh
npm install -g http-server
http-server .
```

Then when you load the application by hitting `http://localhost:8080`, you should see the pre-rendered document in the initial HTTP response (for each route in your application). To see what the prerendered document looks like, open Chrome Developer Tools and click the `Disable JavaScript` option. This way you can see the server-rendered document and prevent the client app from booting.

An example application like the one I have just described is available in the [`examples/cli`](https://github.com/clbond/angular-ssr/tree/master/examples/cli) directory. It also uses `@angular/material` to prove that Material works with `angular-ssr`.

## Additional examples

Additional examples are available in the [Examples](#example-projects) section.

# Use cases

## On-demand server-side rendering and caching

I think this is likely to be the most common usage of `angular-ssr`:
- [x] You have an HTTP server application that you build as part of your application using webpack
- [x] When you build your application, you are outputting two targets: your actual Angular client application, and your HTTP server application

We are going to focus on the server application here because there will be zero changes to your client application code.

Your actual HTTP server code will look something like the following:

```typescript
import {ApplicationBuilderFromModule} from 'angular-ssr';

import {join} from 'path';

import {AppModule} from '../src/app/app.module';

import express = require('express');

import url = require('url');

const dist = join(process.cwd(), 'dist');

const builder = new ApplicationBuilderFromModule(AppModule, join(dist, 'index.html'));

const application = builder.build();

const http = express();

http.get(/.*/, async (request, response) => {
  try {
    const snapshot = await application.renderUri(absoluteUri(req));

    response.send(snapshot.renderedDocument);
  }
  catch (exception) {
    response.send(builder.templateDocument()); // fall back on client document
  }
});

http.listen(process.env.PORT);

const absoluteUri = (request: express.Request): string => {
  return url.format({
    protocol: request.protocol,
    host: request.get('host'),
    pathname: request.originalUrl
  });
};
```

### Prerendering

Pre-rendering is the process of rendering of all routes that do not take parameters at server startup time instead of when thoseroutes are first requested. This may or may not be appropriate for your application, depending on its content and what is rendered inside of those routes. Perhaps you really do want to render them on-demand with a short TTL. You have to choose what makes sense for your application. If you do want to do prerendering, the code in your server will look vaguely like this:

```typescript
// Pre-render all routes that do not take parameters (angular-ssr will discover automatically).
// This is completely optional and may not make sense for your application if even parameterless
// routes contain dynamic content. If you don't want prerendering, skip to the next block of code.
// It is best to ignore errors that happen inside this code because it's strictly a performance
// enhancement, so if it fails, you do not want your server to fail as well.
const prerender = async (): Promise<void> => {
  const snapshots = await application.prerender();

  snapshots.subscribe(snapshot => {
    app.get(snapshot.uri, (req, res) => {
      res.send(snapshot.renderedDocument);
    });
  });
};
```

This bit is completely optional.

### Caching

The caching implementations in `angular-ssr` are completely optional and are not integral to the product in any way. The library provides two caching implementations: one that is variant-aware (`MemoryVariantCache`) and one that is not (`MemoryCache`). They are both fixed-size LRU caches that default to 65k items but can accept different sizes in their constructors. But they are very simple abstractions that just sit atop `application.renderUri()` and there is absolutely no requirement that you use them. They all share the same basic implementation:

```typescript
  async load(uri: string): Promise<Snapshot<void>> {
    let snapshot = this.cache.get(uri);
    if (snapshot == null) {
      snapshot = await this.application.renderUri(uri);
      this.cache.set(uri, snapshot);
    }
    return snapshot;
  }
```

These cache implementations are being considered for removal or deprecation because they are not appropriate for most applications.

If you want to roll your own caching solution, or just not cache anything, you are absolutely free to do so. Just call `application.renderUri` and you will get a freshly rendered document each time. After that, you can cache it or not cache it or do whatever you want with it. Caching is not an integral part of the library; `MemoryCache` and `MemoryVariantCache` are provided mostly as examples of how to implement basic caching.

## Single-use server-side rendering as part of a build process

If your application does not fall into the categories described above (i.e., you do not need on-demand server-side rendering of all URLs), then perhaps your application falls into another category: single-use server-side rendering as part of the application build process.

In this case, your code will look similar to the HTTP server code above, but instead of integrating with express, you will simply use `ApplicationPrerenderer` to pre-render all application routes and write them to static `.html` files, which you can then serve with the HTTP server of your choosing. Again: this case only makes sense if you do not need on-demand rendering of all application routes.

In this case, your code will look something like this:

```typescript
import {
  ApplicationBuilderFromModule,
  ApplicationPrerenderer,
  HtmlOutput,
} from 'angular-ssr';

import {join} from 'path';

import {AppModule} from '../src/app.module';

const dist = join(process.cwd(), 'dist');

const builder = new ApplicationBuilderFromModule(AppModule, join(dist, 'index.html'));

const application = builder.build();

const html = new HtmlOutput(dist);

const renderer = new ApplicationPrerenderer(application);

renderer.renderTo(html)
  .catch(exception => {
    console.error('Failed to render due to uncaught exception', exception);
  });
```

## preboot

`angular-ssr` integrates with preboot seamlessly. Simply call:

```typescript
builder.preboot(true);
```

or

```
builder.preboot({appRoot: 'application}, ...otherOptions});
```

Then simply call `prebootClient().complete()` from your client-side entrypoint (`main.ts`).

Note that for applications which use `@angular/router`, you do _not_ want to call `complete()` until the router has finished rendering your application. Otherwise the server-rendered document will be hidden before the client-rendered document is ready, producing a white flash that is perceptible to users. Whereas if you call `complete()` after routing is finished, there is no flash and it is a completely seamless transition, invisible to the user:

```typescript
@NgModule({
  ...
})
export class AppComponent {
  constructor(router: Router) {
    const subscription = router.events.subscribe(e => {
      switch (true) {
        case e instanceof NavigationError:
        case e instanceof NavigationComplete:
          prebootClient().complete(); // Call complete() here to avoid screen flicker and ensure a seamless transition!
          subscription.unsubscribe();
          break;
      }
    });
  }
}
```

If you are not using `@angular/router`, you can just call it after client bootstrap completes:

```typescript
const complete = () => prebootClient().complete();

platformBrowserDynamic().bootstrapModule(AppModule).then(complete, complete);
```

## Variants

Now we arrive at the most complex use case. Here we wish to do prerendering and demand rendering inside a NodeJS HTTP server, but we also wish to render variants of each page. For example, our application may support multiple languages. `angular-ssr` supports this using a concept called a _variant_. A variant is essentially a key, a set of unique values, and a _transition function_ which can place the application in the specified state.

### Client code

To illustrate, let's again use the example of locales / languages. Your application has multiple languages and you want to support server-side rendering for each of them. The first time someone loads your application, we set the current language selection to the value of `navigator.language` (eg, "en-US"). We set an application cookie using `document.cookie` so that subsequent loads of the application will include as part of the request the language that the user wishes to view the application in. Assume we have some simple code like this somewhere in the application:

```typescript
import {Component, Injectable, OnInit} from '@angular/core';

@Component({
  selector: 'app',
  template: `<locale-selector [value]="localeService.locale" (select)="onLocaleChanged($event)"></locale-selector>`
})
export class LocaleSelector implements OnInit {
  constructor(public localeService: LocaleService) {}

  onLocaleChanged(locale: string) {
    this.localeService.locale = locale;
  }
}
```

```typescript
import {Injectable} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

@Injectable()
export class LocaleService {
  subject = new ReplaySubject<string>();

  constructor(private cookies: CookieService) {
    this.update(cookies.get<string>('locale') || navigator.language || 'en-US');
  }

  locale(locale?: string): Observable<string> {
    if (locale) {
      this.update(locale);
    }
    return this.subject;
  }

  private update(value: string) {
    this.subject.next(value);

    this.cookies.set('locale', value);
  }
}
```

```typescript
@Injectable()
export class CookieService {
  get map(): Map<string, CookieValue> {
    const components = (document.cookie || String()).split(/(;\s?)/g);

    const tuples = components.map(pair => [string, string] <any> pair.split(/=/));

    return new Map<string, string>(tuples);
  }

  get<T>(key: string): T {
    return this.map.get(key) as any;
  }

  set(key: string, value: string) {
    this.delete(key);

    document.cookie = `${key}=${value.toString()}; path=/; domain=${location.hostname};`;
  }

  delete(key: string) {
    const criterion: Array<[string, string | number]> = [
      ['expires', 'Thu, 01 Jan 1970 00:00:01 GMT'],
      ['path', '/'],
      ['domain', location.hostname],
      ['max-age', 0]
    ];

    while (criterion.length > 0) {
      const serialized = criterion.map(([k, v]) => `${k}=${v}`).join('; ');

      document.cookie = `${key}=;${serialized ? ' ' + serialized : String()}`.trim();

      criterion.pop();
    }
  }
}
```

Essentially what this code is doing is setting a cookie in two events:
1. The user loads the application for the first time and there is no cookie, so we set the cookie value to `navigator.language`, to respect their system locale settings.
2. If the user changes the locale, we update `document.cookie` with the new `locale` setting. Then subsequent HTTP requests will include a correct `locale` value, and we can use that to determine whether to serve them an English or a French page.

### Server code

The code above means that our HTTP requests will match one of two cases:
1. The first time the user loads the application, no cookie will be set, in which case we can default to returning the English variant of the server-side rendered app and wait until we have access to `navigator.language` to select the system-correct locale
2. All subsequent requests will have a `locale` cookie which we can use to determine which language we should return when we are querying our document store.

We can handle this by rendering different _variants_ of our application. Let's assume that our application supports `en-US`, `en-CA` and `fr-FR` locales. This is how we would configure the server:

```typescript
import {Injector, Injectable} from '@angular/core';

import {StateTransition} from 'angular-ssr';

@Injectable()
export class LocaleTransition implements StateTransition<string> {
  constructor(private localeService: LocaleService) {}

  // This is the bit of code that actually executes the transition to set the locale
  // to whichever value is being rendered (but value is guaranteed to be one of the
  // values from the Set we created when we first described the locale variant below).
  // Note that this class can use the ng dependency injection system to retrieve any
  // services that it needs in order to execute the state transition.
  transition(value: string) {
    this.localeService.locale(value);
  }
}

type Variants = {locale: string};

const builder = new ApplicationBuilderFromModule<Variants>(AppModule, join(process.cwd(), 'dist', 'index.html'));

builder.variants({
  locale: {
    values: new Set<string>([
      'en-CA',
      'en-US',
      'fr-FR'
    ]),
    transition: LocaleTransition
  }
});

const application = builder.build();

app.get(/.*/, async (req, res) => {
  try {
    // Remember that we set locale in document.cookie, so all requests after the
    // first-ever application load will have a locale cookie that we can use to
    // decide whether to give the user an English or French pre-rendered page.
    const snapshot = await application.renderUri(absoluteUri(req), {locale: req.cookies.locale});

    res.send(snapshot.renderedDocument);
  }
  catch (exception) {
    res.send(builder.templateDocument()); // fall back on client-side rendering
  }
});
```

Voila! Now whenever the user reloads our application or comes back to it in a few days, we are going to hand them a pre-rendered document that is in the language of their choosing! Simple.

The example in `examples/demand-express` has working code that implements what was just described. Give it a shot!

# APIs

The main contract that you use to define the behaviour of your application in a server context is called [`ApplicationBuilder`](https://github.com/clbond/angular-ssr/blob/master/source/application/builder/builder.ts). It has thorough comments and explains all the ways that you can configure your application when doing server-side rendering. `ApplicationBuilder` is an implementation of the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern). You use it to configure your application and then once you are finished configuring, you call the [`build()`](https://github.com/clbond/angular-ssr/blob/master/source/application/builder/builder.ts#L15) method to get an instance of `Application<V>` (where `V` is an object describing the variants your application understands, or `void` if you are not using variants).

`ApplicationBuilder` is an interface. It has three concrete implementations that you can instantiate, depending on which suits your needs:

* `ApplicationBuilderFromModule<V, M>`
  * If your code has access to the root `@NgModule` definition (obtained through `import` or `require()`), then this is probably the `ApplicationBuilder` that you want to use. It takes a module type and a template HTML document: `dist/index.html`, the **build output** `index.html` that contains all of the `<script>` tags necessary to bootstrap the client application inside the browser. If you use the **source** `index.html` instead, your server will render the application correctly but the client application will fail to boot inside the browser.
* `ApplicationBuilderFromModuleFactory<V>`
  * If your application code has already been run through `ngc` and produced `.ngfactory.js` files, then you can pass your root `@NgModule`'s NgFactory -- not the module definition itself, but its compilation output -- to `ApplicationFromModuleFactory<V>` and you can skip the template compilation process. This results in superior startup performance, but after startup, there is no performance difference between `ApplicationBuilderFromModuleFactory` and any of the other `ApplicationBuilder`s.
* `ApplicationBuilderFromSource<V>`
  * You can use this for projects that use `@angular/cli` if you wish to use inplace compilation to generate an `NgModuleFactory` from raw source code and execute that to render your application on the server. That said, it is probably fairly unlikely that you will ever use this class: its main purpose is for the implementation of the `ng-render` command.

The typical usage of `ApplicationBuilder` looks something like:

```typescript
const builder = new ApplicationBuilderFromModule(MyModule);
builder.templateDocument(indexHtmlFile);

const application = builder.build();

const renderedDocument = application.renderUri('http://localhost/');
```

The entire purpose of `ApplicationBuilder` is to produce an `Application<V>` object. The `Application<V>` interface that you get from `ApplicationBuilder` is the primary API that you will use to render your application. It contains several methods:

```typescript
export interface Application<V> extends Disposable {
  // Render the specified absolute URI with optional variant
  renderUri(uri: string, variant?: V): Promise<Snapshot<V>>;

  // Prerender all of the routes provided from the ApplicationBuilder. If no routes were
  // provided, they will be discovered using discoverRoutes() and filtered down to the
  // routes that do not require parameters (eg /blog/:id will be excluded, / will not)
  prerender(): Promise<Observable<Snapshot<V>>>;

  // Discover all of the routes defined in all the NgModules of this application
  discoverRoutes(): Promise<Array<Route>>;
}
```

Note that because `Application<V>` extends the [`Disposable` interface](https://github.com/clbond/angular-ssr/blob/master/source/disposable.ts), you should call `dispose()` when you are finished with it. Failing to call `dispose()` is likely to result in memory leaks, temporary files not being deleted, and other undesirable behaviour.

## State transfer from server to client

Many applications may wish to transfer some state from the server to the client as part of application bootstrap. `angular-ssr` makes this easy. Simply tell your `ApplicationBuilder` object about your state reader class or function, and any state returned from it will be made available in a service called `StateTransfer<T>`.

On the server, we tell our `ApplicationBuilder` about our state reader class:

```typescript
const builder = new ApplicationBuilderFromModule(AppModule, htmlTemplate);
builder.stateReader(MyStateReader);

const application = builder.build();
```

Your `ServerStateReader` class implementation might look like this:

```typescript
import {Injectable} from '@angular/core';

import {Store} from '@ngrx/store';

import {StateReader} from 'angular-ssr';

@Injectable()
export class MyStateReader implements StateReader<TransmissibleState> {
  constructor(private store: Store<AppState>) {}

  getState(): Promise<TransmissibleState> {
    return this.store.select(s => this.transmissibleState(s)).toPromise();
  }

  private transmissibleState(s: AppState): TransmissibleState {
    return {
      foo: s.foo
    };
  }
}
```

Note that you can inject any service you wish into your state reader. `angular-ssr` will query the constructor arguments using the ng dependency injector the same way it works in application code. Alternatively, you can supply a function which just accepts a bare `Injector` and you can query the DI yourself:

```typescript
builder.stateReader((injector: Injector) => injector.get(Store).select().toPromise());
```

Both are equivalent, but the class-based solution is probably cleaner and easier to understand.

**Note that your state reader will not be called until your application zone becomes stable**. That is to say, when all macro and microtasks have finished. For example, if your application has some pending HTTP requests, `angular-ssr` will wait for those to finish before asking your state reader for its state. This ensures that your application has finished initializing itself by the time the state reader is invoked.

## `Snapshot<V>`

Another interesting one is [`Snapshot`](https://github.com/clbond/angular-ssr/blob/master/source/snapshot/snapshot.ts). This is the data structure you get back from the server-side rendering process. It takes a type argument that represents the variants your application is aware of, or `void` if you are not using variants.

One thing to note about `Snapshot` is that it contains far more information than just the final rendered document. It has:

* `console: Array<ConsoleLog>`
  * This is an array of console logs that your application emitted during bootstrap and during the rendering process. It includes errors, infos, warnings, assertions, and anything else that you can emit via `console`.
* `exceptions: Array<Error>`
  * This is an array containing any uncaught exceptions that were generated during the bootstrap and rendering process. Generally it is possible to get back a snapshot that has an empty document and at least one exception in `exceptions`, so you should usually check this in your retrieval methods to ensure that everything worked properly. You don't want to send a mangled document to the user.
* `renderedDocument: string`
  * This is what you are primarily interested in: the final version of the rendered application HTML. This contains the document you will need to send in your HTTP response.
* `variant: V`
  * If you are using [variants](#variants), this describes the particular set of variants that were used to generate this snapshot.
* `uri: string`
  * This is the URI that was originally given to the renderer when this snapshot was generated.

## Very simple (example) caching implementations

The library provides two extremely simple caching implementations. Both are LRU caches that default to a maximum size of 65k items. They are unlikely to be useful to you if your application contains a lot of dynamic content, but they illustrate how you can implement caching inside of your server application:

1. [`MemoryCache`](https://github.com/clbond/angular-ssr/blob/master/source/store/memory-cache.ts) is an extremely simple URL-based bounded LRU cache. Each time a URL is requested, it gets bumped to a higher priority. If the cache reaches its maximum size, documents that were last requested a long time ago will be the first to be deleted.
2. [`MemoryVariantCache`](https://github.com/clbond/angular-ssr/blob/master/source/store/memory-variant-cache.ts) is identical to `MemoryCache` except that it works in conjunction with the concept of [variants](#variants). It uses a [trie structure](https://en.wikipedia.org/wiki/Trie) to store and query specific variants of URLs.

Alternatively, you can provide your own caching mechanism and just call `application.renderUri()` when there is a miss. This is the solution that is going to be the most flexible and allows you to customize your caching needs to suit your application (for example, you may wish to integrate with an external caching service built with Redis or some such).

# Zone stability issues

The problems you are most likely to run into revolve around zone stability.

If you are familiar with Angular 4, you know that all application code executes inside of a zone. The same is true of applications running in `angular-ssr`. Each render operation causes a new zone to be forked from the `<root>` zone. All operations (synchronous or asynchronous) then execute inside of that zone. `angular-ssr` also uses zones to map global objects like `document` and `window` to the correct values even if multiple render operations are executing concurrently. Lastly, the library uses zone.js determine whether your application is _stable_. Stable means that **all macrotasks and microtasks have completed**. The library will wait for your zone to become stable before it attempts to do any of the following:

* Reading state through the `StateReader<T>` construct described above
* Rendering the application into an HTML document
* Executing postprocessor transformations

This is fairly easy to understand. There are lots of resources online that can provide additional information and guidance on zone:

* [Zone Primer from Google](https://docs.google.com/document/d/1F5Ug0jcrm031vhSMJEOgp1l-Is-Vf0UCNDY-LsQtAIY)
* [Zone APIs](https://github.com/angular/zone.js/blob/master/dist/zone.js.d.ts)
* [zone.js training materials from Rangle.io](https://angular-2-training-book.rangle.io/handout/zones/)
* [Understanding zones](https://blog.thoughtram.io/angular/2016/01/22/understanding-zones.html)

Many issues can surface if your application zone fails to become stable quickly:

* The longer it takes your application to become stable, the longer it takes to render your application and send the HTTP response
* If your application never becomes stable, you will encounter the following yellow warning message to the console:

Timed out while waiting for NgZone to become stable after 5000ms! This is a serious performance problem!
This likely means that your application is stuck in an endless loop of change detection or some other pattern of misbehaviour
In a normal application, a zone becomes stable very quickly

At this point, the SSR library will just assume that the application will never stabilize and will go ahead with the render anyway. This is very dangerous because your application may be in the middle of some kind of state transition or waiting for a network response. So it is very important to ensure that your application becomes stable quickly when running on the server, otherwise you risk poor performance and mangled responses.

If your application requests large amounts of data on startup and it takes a while, one potential solution is to pre-request the data it needs and store it in some sort of cache. Presumably you would update this cache periodically with new data. Then instead of requesting data directly from the running application on the server, you can inject it using a bootstrapper:

```typescript
const cachedState = // some construct that you use to store init state across requests

import {Bootstrap} from 'angular-ssr';

@Injectable()
export class InjectStateIntoApplication implements Bootstrap {
  constructor(private store: Store<AppState>) {}

  bootstrap() {
    store.dispatch({type: 'INJECT_CACHED_STATE', payload: cachedState});
  }
}

const builder = new ApplicationBuilderFromModule(AppModule, index);
builder.bootstrap(InjectStateIntoApplication);
```

This means that we will not have to wait for HTTP requests to finish before we render the application, increasing performance and reducing the risk of sending a bad document in the HTTP response.

# Example projects

## CLI based project that uses `@angular/material`

The `examples/cli` folder contains a project that was generated with `ng new`, and which also integrates with `@angular/material`, and uses the `ng-render` command to render itself as part of the build process. This is the simplest possible usage of angular-ssr and covers very basic applications.

## On-demand rendering using express

A project using express and `angular-ssr` lives in the [`examples/demand-express`](https://github.com/clbond/angular-ssr/tree/master/examples/demand-express) directory.

## On-demand rendering using koa

*NOTE*: This has not been implemented yet but you can easily adapt the express example for koa

A project using koa and `angular-ssr` lives in the [`examples/demand-koa`](https://github.com/clbond/angular-ssr/tree/master/examples/demand-koa) directory.

# FAQ

1. Do I have to create separate modules for client and server?
	* No. You can use your existing root module even if it imports `BrowserModule`, `BrowserAnimationsModule` or any other such imports.
2. Can I send HTTP requests when the application is running on the server? Do I have to import a different `HttpModule`?
	* Yes, you can use the HTTP libraries in any way that you normally would. But if you want to avoid requesting the same data on both the server and the client, I would suggest that you make use of the state transfer feature to transmit this data to the client from the server. This way the client does not need to make a duplicate request to retrieve the same data that the server already got.
3. Can I use `document` or `window`? What if I am using a library that accesses `document` or `window`?
	* While it is generally inadvisable to access `document` and `window` from inside an Angular application, I recognize that real-world applications often use libraries that manipulate or query the DOM in some way or another. Therefore, you can access and manipulate `document` and `window` from an angular-ssr application running on the server. Each rendering context gets its own instance of `document` and `window` and using these objects should generally not produce any issues.
	* However, it is important to note that while your application will have access to `document` and `window` on the server, **any operations designed to get the pixel size or location of any particular elements is likely to fail or return all zeros**. This is because there is no rendering happening in the process. You are given a working DOM implementation, but that doesn't make it a browser. So adding, removing and manipulating DOM elements is OK, but if you are trying to query the size of certain elements, that is not a strategy that is going to work on code running on the server. You must avoid that, but mostly everything else is fair game.
4. Can I use jQuery plugins?
	* For the most part, yes, but again with the caveat that anything which tries to query pixel sizes is going to fail or return zeros. Generally speaking it is **best to avoid jQuery plugins in Angular 4 applications**, but you can probably still make it work with `angular-ssr`.

# Comments, queries, or rants

Direct your vitriol to chris.bond@rangle.io or post an issue on this GitHub repo!
