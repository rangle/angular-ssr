import {renderableRoutes} from '../../route';

import {
  BasicInlineModule,
  BasicRoutedModule,
  loadApplicationFixtureFromModule,
} from '../../test/fixtures';

describe('renderableRoutes', () => {
  it('discovers a single route (/) for an NgModule that does not use the router', async () => {
    const application = loadApplicationFixtureFromModule(BasicInlineModule);
    try {
      const routes = renderableRoutes(await application.discoverRoutes());

      expect(routes.length).toBe(1);
      expect(routes[0].path).toEqual([]);
    }
    finally {
      application.dispose();
    }
  });

  it('discovers multiple routes from an application that does use the router', async () => {
    const application = loadApplicationFixtureFromModule(BasicRoutedModule);
    try {
      const result = renderableRoutes(await application.discoverRoutes());

      expect(result.length).toBe(2);
      expect(result[0].path).toEqual([]);
      expect(result[1].path).toEqual(['one']);
    }
    finally {
      application.dispose();
    }
  });
});