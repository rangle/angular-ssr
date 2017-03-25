import 'zone.js';

import {LOCALE_ID, Injector} from '@angular/core';

import {PlatformLocation} from '@angular/common';

import {ConsoleCollector} from '../collectors';
import {DocumentContainer} from '../document';
import {PlatformException} from '../../exception';
import {RuntimeModuleLoader} from '../module';

declare const Zone;

const environment = <any> global;
if (environment.window != null ||
    environment.document != null) {
  throw new PlatformException('Executing outside a browser, but window and document are non-null!');
}

const map = new Map<any, Injector>();

export const mapZoneToInjector = (injector: Injector): () => void => {
  const currentZone = Zone.current;

  map.set(currentZone, injector);

  return () => map.delete(currentZone);
};

const getFromMap = <T>(token): T => {
  const injector = map.get(Zone.current);
  if (injector == null) {
    return null;
  }
  return injector.get(token);
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

Object.defineProperties(environment, {
  console: {
    get: () => fromInjectable<ConsoleCollector>(ConsoleCollector) || baseConsole,
  },
  document: {
    get: () => fromInjectable<Document>(DocumentContainer, c => c.document),
  },
  location: {
    get: () => fromInjectable<PlatformLocation>(PlatformLocation),
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
    get: () => fromInjectable<Window>(DocumentContainer, c => c.window),
  },
});

if (environment.System == null) { // ng cli only
  Object.defineProperties(environment, {
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
