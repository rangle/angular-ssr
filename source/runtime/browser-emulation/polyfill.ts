import {NotImplementedException} from '../../exception';

import {MutationObserver} from './mutation-observer';

import {Range} from './range';

import {Selection} from './selection';

import {atob, btoa} from './base64';

import {cancelAnimationFrame, requestAnimationFrame} from './animation';

import fetch, {Request, RequestInit, Response} from 'node-fetch';

const domino = require('domino');

const impl = require('domino/lib/impl');

// JavaScript programs are used to accessing these functions through the global window object.
// In the browser, window is equivalent to global 'this'. A good example is getComputedStyle.
// Strictly speaking, this is part of window, so if you are calling it you should explicitly
// use targetWindow().getComputedStyle(). But many people do not do this: they just call getComputedStyle.
// But window is not part of the global object when running in an angular-ssr context. So we must
// expose window methods as globals so that JavaScript libraries can reference them without an
// explicit window member access. Ultimately these operations will map to the current zone-
// specific window object from the zone mapper.
const createPolyfillsForWindow = (targetWindow: () => Window) => {
  return {
    alert(message: string) {},

    atob(v: string): string | Buffer {
      return atob(v);
    },

    btoa(v: string | Buffer): string {
      return btoa(v);
    },

    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean) {
      return targetWindow().addEventListener(type, listener, useCapture);
    },

    cancelAnimationFrame(id) {
      return cancelAnimationFrame(id);
    },

    fetch(uri: string | Request, request?: RequestInit): Promise<Response> {
      return fetch(uri, request) as any;
    },

    blur() {
      targetWindow().blur();
    },

    close() {
      targetWindow().close();
    },

    global,

    confirm: notImplemented,

    focus() {
      return targetWindow().focus();
    },

    getMatchedCSSRules() {
      return {
        matches: false,
        media: undefined,
        length: 0,
        item: (index: number) => undefined,
        addListener(listener: MediaQueryListListener) {},
        removeListener(listener: MediaQueryListListener) {},
      }
    },

    matchMedia: (queryString: string) => {
      return {
        matches: false,
        media: null,
        length: 0,
        item: (index: number) => undefined,
        addListener(listener: MediaQueryListListener) {},
        removeListener(listener: MediaQueryListListener) {},
      };
    },

    getComputedStyle(element: HTMLElement) {
      const style = new impl.CSSStyleDeclaration(element);

      const baseStyles = {
        display: 'block',
        height: 'auto',
        width: 'auto',
        'font-style': 'normal',
        'font-weight': 'normal',
        'line-height': 'normal',
      };

      for (const key in baseStyles) {
        if (style[key] == null) {
          style[key] = baseStyles[key];
        }
      }

      return style;
    },

    getSelection() {
      return new Selection();
    },

    moveBy(x: number, y: number) {},
    moveTo(x: number, y: number) {},

    resizeBy(x: number, y: number) {},
    resizeTo(x: number, y: number) {},

    scroll() {},
    scrollTo() {},

    open(url: string, name: string, specs, replace) {
      return domino.createWindow(String(), url);
    },

    print() {},

    prompt(prompt: string): string {
      return String();
    },

    requestAnimationFrame,

    stop: notImplemented,
  };
};

const environmentTypes = {
  Object,
  MutationObserver,
  Selection,
  Range,
  Reflect,
};

export const polyfillWindow = (target, getWindow: () => Window): void => {
  const sources = [createPolyfillsForWindow(getWindow), environmentTypes];

  for (const expose of sources) {
    for (const k of Object.keys(expose).filter(k => typeof target[k] === 'undefined')) {
      target[k] = expose[k];
    }
  }
};

const notImplemented = () => {
  throw new NotImplementedException();
};