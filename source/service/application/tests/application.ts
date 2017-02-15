import 'reflect-metadata';

import {ApplicationFromModule} from 'service';

import {
  BasicExternalComponent,
  BasicExternalStyledComponent,
  BasicInlineComponent,
  renderFixture,
  moduleFromComponent,
  trimDocument,
} from 'fixtures';

describe('Application', () => {
  it('should require a template document in order to render', async (done) => {
    const application = new ApplicationFromModule(moduleFromComponent(BasicInlineComponent));
    try {
      await application.render();

      fail(new Error('render should fail due to missing template document'));
    }
    catch (exception) {done()}
  });

  it('should be able to render a Hello World application with inline template', async (done) => {
    const snapshot = await renderFixture(BasicInlineComponent);

    return new Promise<void>((resolve, reject) => {
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
        reject);
    });
  });

  it('should be able to render a Hello World application with external template', async (done) => {
    const snapshot = await renderFixture(BasicExternalComponent);

    return new Promise<void>((resolve, reject) => {
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
        reject);
    });
  });

  it('should be able to render a Hello World application with external template and SCSS styles', async (done) => {
    const snapshot = await renderFixture(BasicExternalStyledComponent);

    return new Promise<void>((resolve, reject) => {
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
        reject);
    });
  });
});