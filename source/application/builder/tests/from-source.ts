import {ApplicationFromSource} from '../from-source';

import {templateDocument, getApplicationProject} from '../../../test/fixtures';

describe('ApplicationFromSource', () => {
  it('can compile a project from source and load a NgFactory module', async () => {
    const project = getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule');

    const application = new ApplicationFromSource(project);

    application.templateDocument(templateDocument);

    const snapshots = await application.prerender();

    return new Promise((resolve, reject) => {
      snapshots.subscribe(
        r => {
          expect(r.exceptions).not.toBeNull();
          expect(r.exceptions.length).toBe(0);
          expect(r.route).not.toBeNull();
          expect(r.route.path.length).toBe(0); // route: /
          expect(r.variant).toBeUndefined();
          expect(r.applicationState).toBeUndefined();
          const expr = /<application ng-version="([^"]+)"><div>Hello!<\/div><\/application>/;
          expect(expr.test(r.renderedDocument)).toBeTruthy();
          application.dispose();
          resolve();
        },
        exception => reject(exception));
    });
  });
});