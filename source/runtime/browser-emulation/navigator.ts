import {LOCALE_ID} from '@angular/core';

import {injectableFromZone} from '../../index';

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
  try {
    const [code, subcode, country] = lang.split(/[_-]/g);

    if (country) {
      return `${code}-${subcode}_${country}`;
    }
    else if (subcode) {
      return `${code}-${subcode}`;
    }
    return code;
  }
  catch (exception) {}

  return null;
};

export const bindNavigator = (target: () => Window) => navigator;