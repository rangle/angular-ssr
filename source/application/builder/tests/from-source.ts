import {ApplicationFromSource} from '../from-source';

import {templateDocument, getApplicationProject} from '../../../test/fixtures';

describe('ApplicationFromSource', () => {
  it('can compile a project from source and render it', async () => {
    const application = new ApplicationFromSource(getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule'));
    application.templateDocument(templateDocument);
    try {
      const snapshots = await application.prerender();

      return await new Promise((resolve, reject) => {
        snapshots.subscribe(
          r => {
            expect(r.exceptions).not.toBeNull();
            expect(r.exceptions.length).toBe(0);
            expect(r.uri).toBe('http://localhost/');
            expect(r.variant).toBeUndefined();
            expect(r.applicationState).toBeUndefined();
            const expr = /<application ng-version="([^"]+)"><div>Hello!<\/div><\/application>/;
            expect(expr.test(r.renderedDocument)).toBeTruthy();
            resolve();
          },
          exception => reject(exception));
      });
    }
    finally {
      application.dispose();
    }
  });

  it('can compile from source and render lazy-loaded routes', async () => {
    const application = new ApplicationFromSource(getApplicationProject('source/test/fixtures/application-lazy-routed', 'BasicLazyRoutedModule'));
    application.templateDocument(templateDocument);
    try {
      const snapshot = await application.renderUri('http://localhost/one');
      expect(snapshot.exceptions).not.toBeNull();
      expect(snapshot.exceptions.length).toBe(0);
      expect(snapshot.uri).toBe('http://localhost/one');
      expect(snapshot.variant).toBeUndefined();
      expect(snapshot.applicationState).toBeUndefined();
      const expr = /<application ng-version="([^"]+)"><router-outlet><\/router-outlet><basic-lazy-component ng-version="([^"]+)">Lazy loaded component!<\/basic-lazy-component><\/application>/;
      expect(expr.test(snapshot.renderedDocument)).toBeTruthy();
    }
    finally {
      application.dispose();
    }
  });
});