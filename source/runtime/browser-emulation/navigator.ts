import {LOCALE_ID} from '@angular/core';

import {injectableFromZone} from '../../platform/zone/injector-map';

import {ApplicationFallbackOptions} from '../../static';

let navigatorLanguage: string | null = null;

const navigator = {
  get appCodeName() {
    return 'Mozilla';
  },
  get appName() {
    return 'Netscape';
  },
  get appVersion() {
    return '5.0';
  },
  get cookieEnabled() {
    return false;
  },
  get languages() {
    return [navigator.language];
  },
  get language() {
    if (navigatorLanguage != null) {
      return navigatorLanguage;
    }
    let locale = injectableFromZone(Zone.current, LOCALE_ID);
    if (locale == null) {
      locale = ApplicationFallbackOptions.locale;
    }
    return locale;
  },
  set language(locale: string) {
    navigatorLanguage = locale;
  },
  get product() {
    return 'Gecko';
  },
  get userAgent() {
    return 'Chrome';
  },
  get vendor() {
    return 'Google Inc.';
  }
};

export const bindNavigator = (target: () => Window) => [true, {navigator}];