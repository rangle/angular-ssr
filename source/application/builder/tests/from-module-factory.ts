import {
  BasicInlineModule,
  templateDocument,
  trimDocument
} from '../../../test/fixtures';

import {applicationBuilderFromModuleFactory} from '../from-module-factory';
import {ServerPlatform, createJitPlatform} from '../../../platform';
import {assertSnapshot} from '../../../snapshot';

describe('applicationBuilderFromModuleFactory', () => {
  it('should be able to render a Hello World application with inline template', async () => {
    const platform = createJitPlatform() as ServerPlatform;
    try {
      const moduleFactory = await platform.compileModule(BasicInlineModule);

      const factory = applicationBuilderFromModuleFactory(moduleFactory, templateDocument);

      const application = factory.build();
      try {
        const snapshots = application.prerender();

        return await new Promise((resolve, reject) => {
          snapshots.subscribe(
            snapshot => {
              assertSnapshot(snapshot);
              const expr = /<application ng-version="([^"]+)"><div>Hello!<\/div><\/application>/;
              expect(snapshot.exceptions).not.toBeNull();
              expect(snapshot.exceptions.length).toBe(0);
              expect(snapshot.variant).toBeUndefined();
              expect(snapshot.applicationState).toBeUndefined();
              expect(expr.test(trimDocument(snapshot.renderedDocument))).toBeTruthy();
              resolve();
            },
            exception => reject(exception));
        });
      }
      finally {
        application.dispose();
      }
    }
    finally {
      platform.destroy();
    }
  });
});