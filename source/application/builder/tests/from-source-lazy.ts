import {ApplicationBuilderFromSource} from '../from-source';

import {templateDocument, getApplicationProject} from '../../../test/fixtures';

describe('ApplicationBuilderFromSource > lazy loaded', () => {
  it('can compile from source and render lazy-loaded routes', async () => {
    const builder = new ApplicationBuilderFromSource(getApplicationProject('source/test/fixtures/application-lazy-routed', 'BasicLazyRoutedModule'), templateDocument);

    const application = builder.build();

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