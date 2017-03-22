import {PlatformImpl} from '../../platform';

import {applicationRoutes, renderableRoutes} from '../../route';

import {
  BasicInlineModule,
  BasicRoutedModule,
  loadApplicationFixtureFromModule,
  templateDocument
} from '../../test/fixtures';

describe('renderable routes', () => {
  it('discovers a single route (/) for an NgModule that does not use the router', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule);
    try {
      const moduleFactory = await application.getModuleFactory();

      const result = renderableRoutes(await applicationRoutes(application.platform, moduleFactory, templateDocument));

      expect(result.length).toBe(1);
      expect(result[0].path).toEqual([]);
    }
    finally {
      application.dispose();
    }
  });

  it('discovers multiple routes from an application that does use the router', async () => {
    const application = loadApplicationFixtureFromModule(BasicRoutedModule);
    try {
      const moduleFactory = await application.getModuleFactory();

      const result = renderableRoutes(await applicationRoutes(application.platform, moduleFactory, templateDocument));

      expect(result.length).toBe(2);
      expect(result[0].path).toEqual([]);
      expect(result[1].path).toEqual(['one']);
    }
    finally {
      application.dispose();
    }
  });
});