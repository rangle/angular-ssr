import {LOCALE_ID} from '@angular/core';

import {PlatformLocation} from '@angular/common';

import {ConsoleCollector} from '../collectors';
import {DocumentContainer} from '../document';
import {PlatformException} from './../../exception';
import {RuntimeModuleLoader} from '../module';
import {bootWindow} from '../../runtime/dom';
import {injectableFromZone} from './injector-map';

if (typeof window !== 'undefined' || typeof document !== 'undefined') {
  throw new PlatformException('Executing in a NodeJS environment but window and document are non-null!');
}

if (typeof Zone === 'undefined') {
  throw new PlatformException(`You must import zone.js into this process (Zone is undefined)`);
}

export const baseConsole = console;

Object.defineProperties(global, {
  console: {
    get: () => {
      return injectableFromZone(Zone.current, ConsoleCollector) || baseConsole;
    }
  },
  document: {
    get: () => {
      const doc = injectableFromZone(Zone.current, DocumentContainer);
      if (doc) {
        return doc.document;
      }
      return bootWindow.document;
    }
  },
  location: {
    get: () => {
      const location = injectableFromZone(Zone.current, PlatformLocation);
      if (location) {
        return location;
      }
      return bootWindow.location;
    }
  },
  navigator: {
    get: () => {
      return {
        get userAgent() {
          return 'Chrome';
        },
        get language() {
          const locale = injectableFromZone(Zone.current, LOCALE_ID);
          if (locale) {
            return locale;
          }
          return 'en-US';
        },
        get cookieEnabled() {
          return false;
        }
      };
    }
  },
  window: {
    get: () => {
      const w = injectableFromZone(Zone.current, DocumentContainer);
      if (w) {
        return w.window;
      }
      return bootWindow;
    }
  },
});

if (global['System'] == null) { // ng cli only
  Object.defineProperties(global, {
    System: {
      get: () => {
        const loader = injectableFromZone(Zone.current, RuntimeModuleLoader);
        if (loader) {
          return {import: (moduleId: string) => loader.load(moduleId)};
        }
        return undefined;
      }
    }
  });
}
