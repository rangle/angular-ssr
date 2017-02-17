import {renderableRoutes} from 'index';

import {
  BasicInlineComponent,
  moduleFactoryFromComponent,
  templateDocument
} from 'test-fixtures';

describe('renderable routes', () => {
  it('should return a single route for an NgModule that does not use Router', async (done) => {
    const moduleFactory = await moduleFactoryFromComponent(BasicInlineComponent);

    const routes = renderableRoutes(moduleFactory, templateDocument);

    routes.then(result => {
      expect(result.length).toBe(1);
      expect(result[0].path).not.toBeNull();
      expect(result[0].path.length).toBe(0);
      done();
    });
  });
});