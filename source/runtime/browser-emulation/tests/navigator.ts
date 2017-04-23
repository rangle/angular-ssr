import {LOCALE_ID} from '@angular/core';

import {runInsideApplication} from '../../../test/fixtures/module';

import {FallbackOptions} from '../../../static';

describe('navigator', () => {
  it('is defined in the context of ng application execution', () => {
    return runInsideApplication('http://localhost/test', moduleRef => {
      expect(window.navigator).not.toBeNull();
      expect(window.navigator.language).toBe(FallbackOptions.locale);
    });
  });

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