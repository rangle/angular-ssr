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
    const application = loadApplicationFixtureFromModule(BasicInlineModule, builder => builder.templateDocument(String()));
    try {
      return await application.prerender()
        .then(() => {
          throw new Error('Expected a failure');
        })
        .catch(() => Promise.resolve(void 0));
    }
    finally {
      application.dispose();
    }
  });

  it('should be able to render a Hello World application with inline template', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule);
    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
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
    }
    finally {
      application.dispose();
    }
  });

  it('should be able to render a Hello World application with external template', async () => {
    const application = loadApplicationFixtureFromModule(BasicExternalModule);
    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
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
    }
    finally {
      application.dispose();
    }
  });

  it('should be able to render a Hello World application with external template and SCSS styles', async () => {
    const application = loadApplicationFixtureFromModule(BasicExternalStyledModule);
    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
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
    }
    finally {
      application.dispose();
    }
  });

  it('should be able to render an application that uses the router', async () => {
    let expectedCount = 2;

    const snapshots = await renderModuleFixture(BasicRoutedModule);

    return await new Promise((resolve, reject) => {
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
    const application = loadApplicationFixtureFromModule(BasicRoutedModule,
      builder => {
        builder.stateReader(
          injector => {
            const router = injector.get(Router);
            const routes = extractRoutesFromRouter(router);
            return Promise.resolve(routes.map(r => r.path));
          });
      });

    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
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
    }
    finally {
      application.dispose();
    }
  });

  it('can render a specific URI on demand', async () => {
    const application = loadApplicationFixtureFromModule(BasicRoutedModule);
    try {
      const snapshot = await application.renderUri('http://localhost/one');
      expect(snapshot.uri).toBe('http://localhost/one');
      expect(snapshot.exceptions.length).toBe(0);
      expect(snapshot.exceptions).not.toBeNull();
      expect(snapshot.exceptions.length).toBe(0);
      expect(snapshot.variant).toBeUndefined();
      expect(snapshot.applicationState).toBeUndefined();
      expect(snapshot.renderedDocument).not.toBeNull();
      expect(/Routed/.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();
    }
    finally {
      application.dispose();
    }
  });

  it('can collect console log statements that happen during application execution', async () => {
    const application = loadApplicationFixtureFromModule(BasicRoutedModule);
    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
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
    }
    finally {
      application.dispose();
    }
  });
});