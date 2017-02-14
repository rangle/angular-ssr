import 'reflect-metadata';

import {Type} from '@angular/core';

import {Application} from 'service';

import {
  BasicExternalModule,
  BasicInlineModule,
  documentTemplate
} from 'fixtures';

describe('Application', () => {
  it('should require a template document in order to render', async (done) => {
    const application = new Application(BasicInlineModule);
    try {
      await application.render();

      fail(new Error('render should fail due to missing template document'));
    }
    catch (exception) {done()}
  });

  const render = async <M>(moduleType: Type<M>) => {
    const application = new Application(moduleType);
    application.templateDocument(documentTemplate);

    const snapshot = await application.render();
    expect(snapshot).not.toBeNull();

    return snapshot;
  };

  it('should be able to render a Hello World application with inline template', async (done) => {
    const snapshot = await render(BasicInlineModule);

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
    const snapshot = await render(BasicExternalModule);

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
});