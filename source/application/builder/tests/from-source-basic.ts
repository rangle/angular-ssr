import {ApplicationBuilderFromSource} from '../from-source';

import {templateDocument, getApplicationProject} from '../../../test/fixtures';

describe('ApplicationBuilderFromSource > basic', () => {
  it('can compile a basic project from source and render it', async () => {
    const builder = new ApplicationBuilderFromSource(getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule'), templateDocument);

    const application = builder.build();

    const snapshots = await application.prerender();

    try {
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
});
