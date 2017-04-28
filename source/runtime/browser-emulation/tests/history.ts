import {createApplicationTestContext} from '../../../test/fixtures';

describe('history', () => {
  it('is defined in the context of ng application execution', async () => {
    const context = await createApplicationTestContext();
    try {
      return await context.run(async () => {
        expect(window.history).not.toBeNull();
        expect(window.history.state).toBeUndefined();
      });
    }
    finally {
      context.dispose();
    }
  });
});