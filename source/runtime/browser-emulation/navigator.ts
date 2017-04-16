import {LOCALE_ID} from '@angular/core';

import {injectableFromZone} from '../../platform/zone/injector-map';

const navigator = {
  get userAgent() {
    return 'Chrome';
  },
  get language() {
    const locale = injectableFromZone(Zone.current, LOCALE_ID);
    if (locale) {
      return locale;
    }
    return parseLanguage(process.env['LANG']) || 'en-US';
  },
  get cookieEnabled() {
    return false;
  }
};

const parseLanguage = (lang: string): string => {
  if (lang == null || lang.length === 0) {
    return null;
  }

  const [code, subcode, country] = lang.split(/[_-]/g);

  if (country) {
    return `${code}-${subcode}_${country}`;
  }
  else if (subcode) {
    return `${code}-${subcode}`;
  }
  return code;
};

export const bindNavigator = (target: () => Window) => navigator;