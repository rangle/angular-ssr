import 'reflect-metadata';

const domino = require('domino');

const impl = require('domino/lib/impl');

// Expose all the DOM types and event types because they are used in ng property decorators
Object.assign(global, impl, {KeyboardEvent: impl.Event});

Object.assign(global, {CSS: null});

// What we want to do here is create a prototype document that subsequent render operations
// will use as a basis for their own window and document objects. This ensures that any
// scripts which modify the DOM as part of their initialization code (which is much more common
// than you may think) will not lose their changes to the DOM (because we create a separate
// window and DOM for each render operation).
export const bootWindow = domino.createWindow('<html><head></head><body></body></html>', 'http://localhost/');

Object.defineProperties(bootWindow, {
  navigator: { // this will be changed later in the zone mapper
    get: () => {
      return {
        get userAgent() {
          return 'Chrome';
        },
        get language() {
          return 'en-US';
        },
        get cookieEnabled() {
          return false;
        }
      };
    }
  }
});

Object.assign(bootWindow, {global, Reflect, Object});

Object.assign(global, {global, Reflect});