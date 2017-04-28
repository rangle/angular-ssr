import {runInsideApplication} from '../../../test/fixtures/module';

describe('MutationObserver', () => {
  it('provides a constructor implementation', async () => {
    const context = await runInsideApplication('http://localhost');
    try {
      return await context.run(() => {
        expect(() => new MutationObserver(() => {})).not.toThrow();
      });
    }
    finally {
      context.dispose();
    }
  });
})