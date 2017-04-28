import {Router} from '@angular/router';

import {LocationStrategy} from '@angular/common';

import {
  BasicInlineModule,
  BasicExternalModule,
  BasicExternalStyledModule,
  BasicRoutedModule,
  loadApplicationFixtureFromModule,
  renderModuleFixture,
  trimDocument,
} from '../../../test/fixtures';

import {ConsoleType, assertSnapshot} from '../../../snapshot';

import {extractRoutesFromRouter} from '../../../route';

describe('ApplicationBuilderFromModule', () => {
  it('should require a template document in order to render', () => {
    try {
      const application = loadApplicationFixtureFromModule(BasicInlineModule, builder => builder.templateDocument(String()));

      application.dispose();

      return Promise.reject(new Error('Expected an exception to be thrown'));
    }
    catch (exception) {
      return Promise.resolve();
    }
  });

  it('should be able to render a Hello World application with inline template', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule);
    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
        snapshots.subscribe(
          snapshot => {
            assertSnapshot(snapshot);
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
            assertSnapshot(snapshot);
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
            assertSnapshot(snapshot);
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
          assertSnapshot(snapshot);
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

  it('should fail if state reader throws an exception or returns a rejected promise', async () => {
    const application = loadApplicationFixtureFromModule(BasicRoutedModule,
      builder => {
        builder.stateReader(() => Promise.reject('This is an expected exception'));
      });

    const stream = await application.prerender();

    return new Promise<void>((resolve, reject) => {
      stream.subscribe(s => reject(new Error('Should have thrown an exception and failed')), resolve);
    });
  });

  it('should be able to transmit state from the server to the client in the prerendered document', async () => {
    const application = loadApplicationFixtureFromModule(BasicRoutedModule,
      builder => {
        builder.stateReader(
          injector => {
            const router = injector.get(Router);
            const routes = extractRoutesFromRouter(router, injector.get(LocationStrategy));
            return Promise.resolve(routes.map(r => r.path));
          });
      });

    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
        snapshots.subscribe(
          snapshot => {
            assertSnapshot(snapshot);
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
      assertSnapshot(snapshot);
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
            assertSnapshot(snapshot);
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

  it('can inject preboot initialization code into rendered document', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule,
      b => b.preboot({appRoot: 'application'}));

    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
        snapshots.subscribe(
          snapshot => {
            assertSnapshot(snapshot);
            const expr = /prebootstrap\(\).init\({(.*),"appRoot":"application"}\);/;
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

  it('can auto-detect root component selector when injecting preboot code', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule, b => b.preboot(true));
    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
        snapshots.subscribe(
          snapshot => {
            assertSnapshot(snapshot);
            const expr = /prebootstrap\(\).init\({(.*),"appRoot":\["application"\]}\);/;
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

  it('can inject preboot initialization code into rendered document', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule,
      b => b.preboot({appRoot: 'application'}));

    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
        snapshots.subscribe(
          snapshot => {
            assertSnapshot(snapshot);
            const expr = /prebootstrap\(\).init\({(.*),"appRoot":"application"}\);/;
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

  it('can apply postprocessor to DOM', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule,
      b => {
        b.postprocess((document, rendered) => {
          const element = document.createElement('style');
          element.setAttribute('type', 'text/css');
          element.textContent = `
            body {
              margin: 1em;
            }`;
          document.head.appendChild(element);
        });
      });

    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
        snapshots.subscribe(
          snapshot => {
            assertSnapshot(snapshot);
            const expr1 = /<application ng-version="([^"]+)"><div>Hello!<\/div><\/application>/;
            const expr2 = /margin: 1em/;
            expect(snapshot.exceptions).not.toBeNull();
            expect(snapshot.exceptions.length).toBe(0);
            expect(snapshot.variant).toBeUndefined();
            expect(snapshot.applicationState).toBeUndefined();
            const trimmed = trimDocument(snapshot.renderedDocument);
            expect(expr1.test(trimmed)).toBeTruthy();
            expect(expr2.test(trimmed)).toBeTruthy();
            resolve();
          },
          exception => reject(exception));
      });
    }
    finally {
      application.dispose();
    }
  });

  it('can apply postprocessor to rendered document string', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule,
      b => b.postprocess((document, rendered) => rendered.replace('Hello!', 'What up sucka!')));

    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
        snapshots.subscribe(
          snapshot => {
            assertSnapshot(snapshot);
            const expr = /<application ng-version="([^"]+)"><div>What up sucka!<\/div><\/application>/;
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

  it('should fail if postprocessor fails', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule,
      builder => builder.postprocess(
        doc => {
          throw new Error('This is an expected failure');
        }));

    const stream = await application.prerender();

    try {
      return await new Promise<void>((resolve, reject) => {
        stream.subscribe(s => reject(new Error('Should have thrown an exception and failed')), resolve);
      });
    }
    finally {
      application.dispose();
    }
  });

  afterEach(() => {
    if (typeof gc === 'function') {
      gc();
    }
  });
});

declare const gc;