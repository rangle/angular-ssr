import {runInsideApplication} from '../../../test/fixtures/module';

describe('history', () => {
  it('is defined in the context of ng application execution', async () => {
    const context = await runInsideApplication('http://localhost/');
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