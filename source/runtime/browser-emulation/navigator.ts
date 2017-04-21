import {LOCALE_ID} from '@angular/core';

import {injectableFromZone} from '../../platform/zone/injector-map';

import {FallbackOptions} from '../../static';

const navigator = {
  get userAgent() {
    return 'Chrome';
  },
  get language() {
    const locale = injectableFromZone(Zone.current, LOCALE_ID);
    if (locale) {
      return locale;
    }
    return FallbackOptions.locale;
  },
  get cookieEnabled() {
    return false;
  }
};

export const bindNavigator = (target: () => Window) => ({navigator});