import {renderableRoutes} from 'index';

import {BasicModule} from 'tests';

describe('renderable routes', () => {
  it('should return a single route for an NgModule that does not use Router', done => {
    const routes = renderableRoutes(BasicModule);

    routes.then(result => {
      expect(result.length).toBe(1);
      expect(result[0]).toBe('/');
      done();
    });
  });
});