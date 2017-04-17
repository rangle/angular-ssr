import './assertions';

import {ConsoleCollector} from '../collectors';
import {DocumentContainer} from '../document';
import {LocationImpl} from '../location/location';
import {RuntimeModuleLoader} from '../module/runtime-loader';
import {bootWindow} from '../../runtime/browser-emulation';
import {injectableFromZone} from './injector-map';

export const baseConsole = console;

Object.defineProperties(global, {
  console: {
    get: () => {
      return injectableFromZone(Zone.current, ConsoleCollector) || baseConsole;
    }
  },
  document: {
    get: () => {
      let container: {document} = injectableFromZone(Zone.current, DocumentContainer);
      if (container == null) {
        container = bootWindow;
      }
      return container.document;
    }
  },
  location: {
    get: () => {
      let location: Location = injectableFromZone(Zone.current, LocationImpl);
      if (location == null) {
        location = window.location;
      }
      return location;
    }
  },
  navigator: {
    get: () => {
      return window.navigator;
    },
  },
  window: {
    get: () => {
      const documentContainer = injectableFromZone(Zone.current, DocumentContainer);

      return documentContainer == null
        ? bootWindow
        : documentContainer.window;
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