import {Application} from 'service';

import {BasicModule} from './application-basic';

describe('renderer', () => {
  it('should perform basic validation on Application configuration', done => {
    const application = new Application<BasicModule, {}>(BasicModule);

    application.render().catch(done);
  });
});