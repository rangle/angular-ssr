import {renderableRoutes} from 'index';

import {
  BasicInlineComponent,
  moduleFromComponent,
  documentTemplate,
} from 'fixtures';

describe('renderable routes', () => {
  it('should return a single route for an NgModule that does not use Router', done => {
    const routes = renderableRoutes(moduleFromComponent(BasicInlineComponent), documentTemplate);

    routes.then(result => {
      expect(result.length).toBe(1);
      expect(result[0].path).not.toBeNull();
      expect(result[0].path.length).toBe(0);
      done();
    });
  });
});