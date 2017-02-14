import {Application} from 'service';

import {documentTemplate, BasicModule} from 'tests';

describe('Application', () => {
  it('should require a template document in order to render', async (done) => {
    const application = new Application(BasicModule);
    try {
      await application.render();
    }
    catch (err) {
      expect(err.message).toContain('No template HTML');
      done();
    }
  });

  it('should be able to render a Hello World application', async (done) => {
    const application = new Application(BasicModule);
    application.templateDocument(documentTemplate);

    const snapshot = await application.render();
    expect(snapshot).not.toBeNull();

    return new Promise<void>((resolve, reject) => {
      snapshot.subscribe(
        rendered => {
          const {variant, applicationState, renderedDocument, route} = rendered;
          expect(route).not.toBeNull();
          expect(route.path.length).toBe(0); // route: /
          expect(variant).toBeUndefined();
          expect(applicationState).toBeUndefined();
          const expr = /<application ng-version="([\d\.]+)"><div>Hello!<\/div><\/application>/;
          expect(expr.test(renderedDocument)).toBeTruthy();
          done();
        },
        reject);
    })
  })
});