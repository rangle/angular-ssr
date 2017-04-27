import {join} from 'path';

import {ApplicationBuilderFromSource} from '../from-source';
import {Project} from '../../project';
import {absoluteFile, absolutePath, pathFromRandomId} from '../../../filesystem';
import {getApplicationRoot} from '../../../test/fixtures';

describe('ApplicationBuilderFromSource > webpack', () => {
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
      const expr = /This is blog ID/;
      expect(expr.test(snapshot.renderedDocument)).toBeTruthy();
    }
    finally {
      application.dispose();
    }
  });
});
