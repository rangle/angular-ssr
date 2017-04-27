import {runInsideApplication} from '../../../test/fixtures/module';

describe('history', () => {
  it('is defined in the context of ng application execution', () => {
    return runInsideApplication('http://localhost/', () => {
      expect(window.history).not.toBeNull();
      expect(window.history.state).toBeUndefined();
    });
  });
});