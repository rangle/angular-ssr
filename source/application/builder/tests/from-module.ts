import {ApplicationFromModule} from 'application';

import {
  BasicExternalComponent,
  BasicExternalStyledComponent,
  BasicInlineComponent,
  BasicRoutedModule,
  renderComponentFixture,
  renderModuleFixture,
  moduleFromComponent,
  trimDocument,
} from 'test-fixtures';

describe('ApplicationFromModule', () => {
  it('should require a template document in order to render', done => {
    const application = new ApplicationFromModule(moduleFromComponent(BasicInlineComponent));
    application.render()
      .then(() => {
        done.fail(new Error('render should fail due to missing template document'));
      })
      .catch(exception => done());
  });

  it('should be able to render a Hello World application with inline template', done => {
    renderComponentFixture(BasicInlineComponent)
      .then(snapshots => {
        snapshots.subscribe(
          snapshot => {
            const expr = /<application ng-version="([\d\.]+)"><div>Hello!<\/div><\/application>/;
            expect(snapshot.exceptions).not.toBeNull();
            expect(snapshot.exceptions.length).toBe(0);
            expect(snapshot.variant).toBeUndefined();
            expect(snapshot.applicationState).toBeUndefined();
            expect(expr.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();
            done();
          },
          exception => done.fail(exception));
      });
  });

  it('should be able to render a Hello World application with external template', done => {
    renderComponentFixture(BasicExternalComponent)
      .then(snapshots => {
        snapshots.subscribe(
          snapshot => {
            const expr = /<application ng-version="([\d\.]+)"><div>Hello!<\/div><\/application>/;
            expect(snapshot.exceptions).not.toBeNull();
            expect(snapshot.exceptions.length).toBe(0);
            expect(snapshot.variant).toBeUndefined();
            expect(snapshot.applicationState).toBeUndefined();
            expect(expr.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();
            done();
          },
          exception => done.fail(exception));
      });
  });

  it('should be able to render a Hello World application with external template and SCSS styles', done => {
    renderComponentFixture(BasicExternalStyledComponent)
      .then(snapshots => {
        snapshots.subscribe(
          snapshot => {
            const expr = /<style>div\[_ngcontent-([a-z\d]{3})-(\d)\] { background-color: black;/;
            expect(snapshot.exceptions).not.toBeNull();
            expect(snapshot.exceptions.length).toBe(0);
            expect(snapshot.variant).toBeUndefined();
            expect(snapshot.applicationState).toBeUndefined();
            expect(expr.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();
            done();
          },
          exception => done.fail(exception));
      });
  });

  it('should be able to render an application that uses the router', done => {
    let expectedCount = 2;

    renderModuleFixture(BasicRoutedModule)
      .then(snapshots => {
        snapshots.subscribe(
          snapshot => {
            expect(snapshot.exceptions).not.toBeNull();
            expect(snapshot.exceptions.length).toBe(0);
            expect(snapshot.variant).toBeUndefined();
            expect(snapshot.applicationState).toBeUndefined();
            expect(/Routed/.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();

            if (--expectedCount === 0) {
              done();
            }
          },
          exception => done.fail(exception));
      });
  });
});