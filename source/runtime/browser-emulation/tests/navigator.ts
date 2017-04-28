import {LOCALE_ID} from '@angular/core';

import {ApplicationTestContext, createApplicationTestContext} from '../../../test/fixtures';

describe('navigator', () => {
  let context: ApplicationTestContext;

  beforeAll(async () => {
    context = await createApplicationTestContext('http://localhost/', [{provide: LOCALE_ID, useFactory: () => 'fr-FR'}]);
  });

  afterAll(() => context.dispose());

  it('is defined in the context of ng application execution', async () => {
    return await context.run(async (moduleRef) => {
      expect(window.navigator).not.toBeNull();
    });
  });

  it('uses LOCALE_ID injection for selected language', async () => {
    return await context.run(() => {
      expect(navigator).not.toBeNull();
      expect(navigator.language).toBe('fr-FR');
      expect(navigator.cookieEnabled).toBe(false);
      expect(navigator.userAgent).toBe('Chrome');
    });
  });
});