import {LOCALE_ID} from '@angular/core';

import {runInsideApplication} from '../../../test/fixtures/module';

describe('navigator', () => {
  it('uses LOCALE_ID injection for selected language', () => {
    return runInsideApplication('http://localhost/', () => {
      expect(navigator).not.toBeNull();
      expect(navigator.language).toBe('fr-FR');
      expect(navigator.cookieEnabled).toBe(false);
      expect(navigator.userAgent).toBe('Chrome');
    },
    [{provide: LOCALE_ID, useFactory: () => 'fr-FR'}]);
  });
});