import {runInsideApplication} from '../../../test/fixtures/module';

describe('MutationObserver', () => {
  it('provides a constructor implementation', () => {
    return runInsideApplication('http://localhost/', () => {
      expect(() => new MutationObserver(() => {})).not.toThrow();
    });
  });
})