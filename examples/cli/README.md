# @angular/cli project with server-side rendering at build time

The purpose of this application is to illustrate the simplest possible use-case of angular-ssr: an `@angular/cli`-based application which renders all of its routes as part of the build step, and writes `index.html` file for each route in the application. So you will end up with a `dist` folder containing:

```
index.html (matches URL: /)
foo/index.html (matches URL: /foo)
foo/biz/index.html (matches URL: /foo/biz)
```

Where each of these folder names matches a route in the application. Each of these `index.html` files will contain a pre-rendered version of the application, rendered specficially for that route. They also contain `<script>` tags that will cause the regular client-side application to boot immediately. The pre-rendered content is a performance optimization that allows you to display the real application while the process of client-side bootstrap occurs.

I performed these steps to arrive at this code:

1. Generated an application with `ng new`.

2. Added a dependency on `@angular/material` with `npm install @angular/material --save`

3. Imported `MaterialModule` from `@angular/material` into `AppModule`.

4. Added some material components into the main application component to illustrate usage of material, and the fact that it works with `angular-ssr`.

5. I edited `package.json` to add a `postbuild` step to run `ng-render`:

```json
  "scripts": {
    "build": "ng build",
    "postbuild": "ng-render"
  }
```

6. These are the only changes that were done on top of the base `ng new` project.

Now when I run `npm run build`, I see this output:

```
despair:cli bond$ npm run build

> angular-ssr-cli-example@0.0.0 build /Users/bond/z/examples/cli
> ng build

Hash: f06f6ae5f67bc2a7403f                                                               
Time: 8300ms
chunk    {0} polyfills.bundle.js, polyfills.bundle.js.map (polyfills) 456 kB {4} [initial] [rendered]
chunk    {1} main.bundle.js, main.bundle.js.map (main) 6.49 kB {3} [initial] [rendered]
chunk    {2} styles.bundle.js, styles.bundle.js.map (styles) 31.5 kB {4} [initial] [rendered]
chunk    {3} vendor.bundle.js, vendor.bundle.js.map (vendor) 2.92 MB [initial] [rendered]
chunk    {4} inline.bundle.js, inline.bundle.js.map (inline) 0 bytes [entry] [rendered]

> angular-ssr-cli-example@0.0.0 postbuild /Users/bond/z/examples/cli
> ng-render

[info] Rendering application from source (working path: /Users/bond/z/examples/cli) 
Could not find HammerJS. Certain Angular Material components may not work correctly.
Angular is running in the development mode. Call enableProdMode() to enable the production mode.
Could not find HammerJS. Certain Angular Material components may not work correctly.
Angular is running in the development mode. Call enableProdMode() to enable the production mode.
[info] Writing rendered route / to /Users/bond/z/examples/cli/dist/index.html 
```

Now I can simply go in to the `dist` folder and run a simple HTTP server:

```sh
despair:cli bond$ cd dist
despair:dist bond$ npm install -g http-server
despair:dist bond$ http-server .
```

And then load the application on `http://localhost:8080`. The transition from server-rendered to client-rendered happens so fast that it is difficult to observe, so you can set throttling very low in Chrome DevTools to see the original SSR version while the client app boots.
