import {renderableRoutes} from '../../route';

import {
  BasicInlineComponent,
  moduleFactoryFromComponent,
  templateDocument
} from '../../test/fixtures';

describe('renderable routes', () => {
  it('should return a single route for an NgModule that does not use Router', async () => {
    const moduleFactory = await moduleFactoryFromComponent(BasicInlineComponent);

    const result = await renderableRoutes(moduleFactory, templateDocument);

    expect(result.length).toBe(1);
    expect(result[0].path).not.toBeNull();
    expect(result[0].path.length).toBe(0);
  });
});