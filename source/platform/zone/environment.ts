import 'zone.js';

import {LOCALE_ID, Injector} from '@angular/core';

import {PlatformLocation} from '@angular/common';

import {ConsoleCollector} from '../collectors';
import {DocumentContainer} from '../document';
import {RuntimeModuleLoader} from '../module';

import {bootWindow} from '../../runtime/dom';

declare const Zone;

const map = new Map<any, Injector>();

export const mapZoneToInjector = (injector: Injector): () => void => {
  const currentZone = Zone.current;

  map.set(currentZone, injector);

  return () => map.delete(currentZone);
};

const getFromMap = <T>(token): T => {
  let iterator = Zone.current;
  while (iterator) {
    const injector = map.get(iterator);
    if (injector) {
      return injector.get(token);
    }
    iterator = iterator._parent;
  }
  return null;
};

export const baseConsole = console;

const fromInjectable = <R>(token, getter?: (value) => R): R => {
  const object = getFromMap(token);
  if (object) {
    if (getter) {
      return getter(object);
    }
    return object as R;
  }
  return undefined;
};

Object.defineProperties(global, {
  console: {
    get: () => fromInjectable<ConsoleCollector>(ConsoleCollector) || baseConsole,
  },
  document: {
    get: () => fromInjectable<Document>(DocumentContainer, c => c.document) || bootWindow.document,
  },
  location: {
    get: () => fromInjectable<PlatformLocation>(PlatformLocation) || bootWindow.location,
  },
  navigator: {
    get: () => {
      return {
        get userAgent() {
          return 'Chrome';
        },
        get language() {
          return fromInjectable<string>(LOCALE_ID) || 'en-US';
        },
        get cookieEnabled() {
          return false;
        }
      };
    }
  },
  window: {
    get: () => fromInjectable<Window>(DocumentContainer, c => c.window) || bootWindow,
  },
});

if (global['System'] == null) { // ng cli only
  Object.defineProperties(global, {
    System: {
      get: () => {
        const loader = fromInjectable<RuntimeModuleLoader>(RuntimeModuleLoader);
        if (loader) {
          return {
            import: (moduleId: string) => loader.load(moduleId)
          };
        }
        return undefined;
      }
    }
  });
}
