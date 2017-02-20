import {ApplicationFromModule} from 'application';

import {
  BasicExternalComponent,
  BasicExternalStyledComponent,
  BasicInlineComponent,
  renderFixture,
  moduleFromComponent,
  trimDocument,
} from 'test-fixtures';

describe('ApplicationFromModule', () => {
  it('should require a template document in order to render', async () => {
    const application = new ApplicationFromModule(moduleFromComponent(BasicInlineComponent));
    try {
      await application.render();

      fail(new Error('render should fail due to missing template document'));
    }
    catch (exception) {}
  });

  it('should be able to render a Hello World application with inline template', done => {
    renderFixture(BasicInlineComponent)
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
            done();
          },
          exception => fail(exception));
      });
  });

  it('should be able to render a Hello World application with external template', done => {
    renderFixture(BasicExternalComponent)
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
            expect(expr.test(trimDocument(r.renderedDocument))).toBeTruthy();
            done();
          },
          exception => fail(exception));
      });
  });

  it('should be able to render a Hello World application with external template and SCSS styles', done => {
    renderFixture(BasicExternalStyledComponent)
      .then(snapshot => {
        snapshot.subscribe(
          r => {
            expect(r.exceptions).not.toBeNull();
            expect(r.exceptions.length).toBe(0);
            expect(r.route).not.toBeNull();
            expect(r.route.path.length).toBe(0); // route: /
            expect(r.variant).toBeUndefined();
            expect(r.applicationState).toBeUndefined();
            const expr = /<head><style>div\[_ngcontent-([a-z\d]{3})-(\d)\] { background-color: black;/;
            expect(expr.test(trimDocument(r.renderedDocument))).toBeTruthy();
            done();
          },
          exception => fail(exception));
      });
  });
});