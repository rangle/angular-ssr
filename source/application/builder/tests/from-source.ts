import {ApplicationFromSource} from '../from-source';

import {
  templateDocument,
  getApplicationProject,
  getTemporaryWorkingPath,
} from '../../../test/fixtures';

describe('ApplicationFromSource', () => {
  it('can compile a project from source and load a NgFactory module', done => {
    const project = getApplicationProject(
      'source/test/fixtures/application-basic-inline',
      'BasicInlineModule',
      getTemporaryWorkingPath());

    const application = new ApplicationFromSource(project);

    application.templateDocument(templateDocument);

    application.prerender()
      .then(snapshot => {
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
            application.dispose();
            done();
          },
          exception => fail(exception));
      });
  });
});