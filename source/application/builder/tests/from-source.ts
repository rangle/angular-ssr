import {ApplicationBuilderFromSource} from '../from-source';
import {Disposable} from '../../../disposable';

import {templateDocument, getApplicationProject} from '../../../test/fixtures';

describe('ApplicationFromSource', () => {
  const disposables = new Array<Disposable>();

  afterAll(() => disposables.forEach(d => d.dispose()));

  it('can compile a project from source and render it', async () => {
    const builder = new ApplicationBuilderFromSource(getApplicationProject('source/test/fixtures/application-basic-inline', 'BasicInlineModule'), templateDocument);

    const application = builder.build();
    disposables.push(application);

    const snapshots = await application.prerender();

    return new Promise((resolve, reject) => {
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
  });

  it('can compile from source and render lazy-loaded routes', async () => {
    const builder = new ApplicationBuilderFromSource(getApplicationProject('source/test/fixtures/application-lazy-routed', 'BasicLazyRoutedModule'), templateDocument);

    const application = builder.build();
    disposables.push(application);

    const snapshot = await application.renderUri('http://localhost/one');

    expect(snapshot.exceptions).not.toBeNull();
    expect(snapshot.exceptions.length).toBe(0);
    expect(snapshot.uri).toBe('http://localhost/one');
    expect(snapshot.variant).toBeUndefined();
    expect(snapshot.applicationState).toBeUndefined();
    const expr = /<application ng-version="([^"]+)"><router-outlet><\/router-outlet><basic-lazy-component ng-version="([^"]+)">Lazy loaded component!<\/basic-lazy-component><\/application>/;
    expect(expr.test(snapshot.renderedDocument)).toBeTruthy();
  });
});