import {join} from 'path';

import {Project} from './../../project';
import {ApplicationBuilderFromSource} from '../from-source';
import {templateDocument, getApplicationProject, getApplicationRoot} from '../../../test/fixtures';
import {pathFromRandomId, absoluteFile, absolutePath} from '../../../filesystem';

describe('ApplicationBuilderFromSource', () => {
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

 it('can compile from source and render lazy-loaded routes', async () => {
    const builder = new ApplicationBuilderFromSource(getApplicationProject('source/test/fixtures/application-lazy-routed', 'BasicLazyRoutedModule'), templateDocument);

    const application = builder.build();

    try {
      const snapshot = await application.renderUri('http://localhost/one');

      expect(snapshot.exceptions).not.toBeNull();
      expect(snapshot.exceptions.length).toBe(0);
      expect(snapshot.uri).toBe('http://localhost/one');
      expect(snapshot.variant).toBeUndefined();
      expect(snapshot.applicationState).toBeUndefined();
      const expr = /<application ng-version="([^"]+)"><router-outlet><\/router-outlet><basic-lazy-component ng-version="([^"]+)">Lazy loaded component!<\/basic-lazy-component><\/application>/;
      expect(expr.test(snapshot.renderedDocument)).toBeTruthy();
    }
    finally {
      application.dispose();
    }
  });

  it('can compile a project with custom webpack config', async () => {
    const root = getApplicationRoot();

    const basePath = absolutePath(root.toString(), join('examples', 'demand-express'));

    const tsconfig = absoluteFile(basePath, 'tsconfig.json');

    const project: Project = {
      basePath,
      tsconfig,
      workingPath: pathFromRandomId(),
    };

    const builder = new ApplicationBuilderFromSource(project, join(project.basePath.toString(), 'app', 'index.html'));

    const application = builder.build();

    try {
      const snapshot = await application.renderUri('http://localhost/');

      expect(snapshot.exceptions).not.toBeNull();
      expect(snapshot.exceptions.length).toBe(0);
      expect(snapshot.uri).toBe('http://localhost/');
      expect(snapshot.variant).toBeUndefined();
      expect(snapshot.applicationState).toBeUndefined();
      const expr = /Sed ut perspiciatis unde/;
      expect(expr.test(snapshot.renderedDocument)).toBeTruthy();
    }
    finally {
      application.dispose();
    }
  });

  afterEach(() => {
    if (typeof gc === 'function') {
      gc();
    }
  });
});

declare const gc: () => void;
