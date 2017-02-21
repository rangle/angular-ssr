import {PlatformException} from 'exception';

declare const Zone;

const environment = <any> global;
if (environment.window != null ||
    environment.document != null) {
  throw new PlatformException('Executing outside a browser, but window and document are non-null!');
}

const zones = new Map();

export const mapZoneToContainer = container => zones.set(Zone.current, container);

export const unmapZoneFromContainer = container => zones.delete(Zone.current);

// Since we more or less have a complete DOM implementation, we can provide access to that
// DOM by mapping the current zone to a DocumentContainer that hosts the document model.
// Therefore when an application tries to access window or document, they receive a reference
// to the real DOM that represents their application. It would be nice if we didn't have to
// do this, but the reality is that most programs reference document and window. Even libraries
// like Angular Material reference document and window.
Object.defineProperties(environment, {
  window: {
    get: () => {
      const container = zones.get(Zone.current);
      if (container) {
        return container.window;
      }
      return undefined;
    }
  },
  document: {
    get: () => {
      const container = zones.get(Zone.current);
      if (container) {
        return container.document;
      }
      return undefined;
    }
  }
});