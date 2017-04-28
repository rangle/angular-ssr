import {createApplicationTestContext} from '../../../test/fixtures';

describe('MutationObserver', () => {
  it('provides a constructor implementation', async () => {
    const context = await createApplicationTestContext();
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