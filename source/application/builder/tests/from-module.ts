import {Router} from '@angular/router';

import {
  BasicInlineModule,
  BasicExternalModule,
  BasicExternalStyledModule,
  BasicRoutedModule,
  loadApplicationFixtureFromModule,
  renderModuleFixture,
  trimDocument,
} from '../../../test/fixtures';

import {ConsoleType} from '../../../snapshot';

import {extractRoutesFromRouter} from '../../../route';

describe('ApplicationFromModule', () => {
  it('should require a template document in order to render', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule);
    application.templateDocument(null);

    return new Promise(async (resolve, reject) => {
      try {
        await application.prerender();
        reject(new Error('Expected a failure'));
      }
      catch (exception) {
        resolve();
      }
    });
  });

  it('should be able to render a Hello World application with inline template', async () => {
    const module = loadApplicationFixtureFromModule(BasicInlineModule);

    const snapshots = await module.prerender();

    return new Promise((resolve, reject) => {
      snapshots.subscribe(
        snapshot => {
          const expr = /<application ng-version="([^"]+)"><div>Hello!<\/div><\/application>/;
          expect(snapshot.exceptions).not.toBeNull();
          expect(snapshot.exceptions.length).toBe(0);
          expect(snapshot.variant).toBeUndefined();
          expect(snapshot.applicationState).toBeUndefined();
          expect(expr.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();
          resolve();
        },
        exception => reject(exception));
    });
  });

  it('should be able to render a Hello World application with external template', async () => {
    const module = loadApplicationFixtureFromModule(BasicExternalModule);

    const snapshots = await module.prerender();

    return new Promise((resolve, reject) => {
      snapshots.subscribe(
        snapshot => {
          const expr = /<application ng-version="([^"]+)"><div>Hello!<\/div><\/application>/;
          expect(snapshot.exceptions).not.toBeNull();
          expect(snapshot.exceptions.length).toBe(0);
          expect(snapshot.variant).toBeUndefined();
          expect(snapshot.applicationState).toBeUndefined();
          expect(expr.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();
          resolve();
        },
        exception => reject(exception));
     });
  });

  it('should be able to render a Hello World application with external template and SCSS styles', async () => {
    const module = loadApplicationFixtureFromModule(BasicExternalStyledModule);

    const snapshots = await module.prerender();

    return new Promise((resolve, reject) => {
      snapshots.subscribe(
        snapshot => {
          const expr = /div\[_ngcontent-([^\]]+)\] { background-color: black;/;
          expect(snapshot.exceptions).not.toBeNull();
          expect(snapshot.exceptions.length).toBe(0);
          expect(snapshot.variant).toBeUndefined();
          expect(snapshot.applicationState).toBeUndefined();
          expect(expr.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();
          resolve();
        },
        exception => reject(exception));
    });
  });

  it('should be able to render an application that uses the router', async () => {
    let expectedCount = 2;

    const snapshots = await renderModuleFixture(BasicRoutedModule)

    return new Promise((resolve, reject) => {
      snapshots.subscribe(
        snapshot => {
          expect(snapshot.exceptions).not.toBeNull();
          expect(snapshot.exceptions.length).toBe(0);
          expect(snapshot.variant).toBeUndefined();
          expect(snapshot.applicationState).toBeUndefined();
          expect(/Routed/.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();

          if (--expectedCount === 0) {
            resolve();
          }
        },
        exception => reject(exception));
    });
  });

  it('should be able to transmit state from the server to the client in the prerendered document', async () => {
    const module = loadApplicationFixtureFromModule(BasicRoutedModule);

    module.stateReader(
      injector => {
        const router = injector.get(Router);
        const routes = extractRoutesFromRouter(router);
        return Promise.resolve(routes.map(r => r.path));
      });

    const snapshots = await module.prerender();

    return new Promise((resolve, reject) => {
      snapshots.subscribe(
        snapshot => {
          expect(snapshot.applicationState).not.toBeNull();
          expect(Array.isArray(snapshot.applicationState)).toBeTruthy();
          const expr = /<script type="text\/javascript">window.bootstrapApplicationState = \[\[\],\["one"\]\];<\/script>/;
          expect(expr.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();
          resolve();
        },
        exception => reject(exception));
    });
  });

  it('can collect console log statements that happen during application execution', async () => {
    const module = loadApplicationFixtureFromModule(BasicRoutedModule);

    const snapshots = await module.prerender();

    return new Promise((resolve, reject) => {
      snapshots.subscribe(
        snapshot => {
          expect(snapshot.console).not.toBeNull();
          expect(Array.isArray(snapshot.console)).toBeTruthy();
          expect(snapshot.console.length).toBe(1);
          expect(snapshot.console[0].type).toBe(ConsoleType.Log);
          expect(snapshot.console[0].args.length).toBe(1);
          expect(/enableProdMode/.test(snapshot.console[0].args[0])).toBeTruthy();
          resolve();
        },
        exception => reject(exception));
    });
  });
});