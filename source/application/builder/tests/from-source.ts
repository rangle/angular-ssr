import {ApplicationFromSource} from '../from-source';

import {templateDocument, getApplicationProject} from 'test-fixtures';

describe('ApplicationFromSource', () => {
  // FIXME(cbond): This test is broken due to multiple NgZone instances due to the
  // Babel transpilation is happening. The compilation succeeds then the render fails.
  // I need to find a way around this.
  xit('can compile a project from source and load a NgFactory module', async (done) => {
    const application =
      new ApplicationFromSource(
        getApplicationProject(
          'test-fixtures/application-basic-inline',
          'BasicInlineApplication'));

    application.templateDocument(templateDocument);

    const snapshot = await application.render();

    snapshot.subscribe(
      r => {
        expect(r.exceptions).not.toBeNull();
        expect(r.exceptions.length).toBe(0);
        expect(r.route).not.toBeNull();
        expect(r.route.path.length).toBe(0); // route: /
        expect(r.variant).toBeUndefined();
        expect(r.applicationState).toBeUndefined();
        const expr = /<application ng-version="([\d\.]+)"><div>Hello!<\/div><\/application>/;
        expect(expr.test(r.renderedDocument)).toBeTruthy();
        done();
      },
      exception => fail(exception));
  });
});