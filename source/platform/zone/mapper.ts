import {Injector} from '@angular/core';

import {ConsoleCollector} from '../collectors';
import {DocumentContainer} from '../document';
import {PlatformException} from '../../exception';
import {RuntimeModuleLoader} from '../runtime-loader';

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

Object.defineProperties(environment, {
  console: {
    get: () => {
      return getFromMap<ConsoleCollector>(ConsoleCollector) || baseConsole;
    }
  },
  window: {
    get: () => {
      const container = getFromMap<DocumentContainer>(DocumentContainer);
      if (container) {
        return container.window;
      }
      return undefined;
    }
  },
  document: {
    get: () => {
      const container = getFromMap<DocumentContainer>(DocumentContainer);
      if (container) {
        return container.document;
      }
      return undefined;
    }
  }
});

if (environment.System == null) {
  Object.defineProperties(environment, {
    System: {
      get: () => {
        const loader = getFromMap<RuntimeModuleLoader>(RuntimeModuleLoader);
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