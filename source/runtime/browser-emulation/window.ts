import 'reflect-metadata';

import {NotImplementedException} from '../../exception';

import {MutationObserver} from './mutation-observer';

import {Range} from './range';

import {Selection} from './selection';

import {atob, btoa} from './base64';

import {cancelAnimationFrame, requestAnimationFrame} from './animation';

import fetch = require('node-fetch');

// Do not look at this file and get the wrong impression that this is the extent of the DOM
// emulation code. It is not. The purpose of this file is not to provide a DOM to the render
// context: that is done elsewhere, in the zone mapper, {@link mapZoneToInjector} and
// {@link injectableFromZone}. This means that each zone -- and by extension, each render
// context because each render operation happens inside of its own zone -- can use the zone
// mapper to map global objects like window and document to operation-specific implementations
// of those objects. That is the real way that we expose the DOM to applications that are
// being rendered.
//
// Now, with that in mind, the purpose of this file is to provide an initial value for window
// and document so that scripts who have initialization code that accesses window or document
// (for example, this is very common in the jQuery world) will not explode and die. They will
// modify this initial DOM, and then when we go to actually create a render-context-specific
// DOM structure, we will use this initial document as a prototype which we will clone. This
// way, changes made to the initial DOM structure are maintained in the render-specific DOM
// implementation because we clone the render-specific DOM from this one on creation.

const domino = require('domino');

const impl = require('domino/lib/impl');

// Expose all the DOM types and event types because they are used in ng property decorators.
// These are part of the impl object that comes back from domino (eg MouseEvent, KeyboardEvent)
Object.assign(global, impl, {CSS: null});

// What we want to do here is create a prototype document that subsequent render operations
// will use as a prototype for their own window and document objects. This ensures that any
// scripts which modify the DOM as part of their initialization code (which is much more
// common than you may think) will not lose their changes to the DOM (because we create a
// separate window and DOM for each render operation, and those are cloned from this DOM).
// But just understand that this window and document will NOT be used in the context of
// a rendering operation: it will be cloned to create new DOM and window objects.

const templateDocument =
  `<!doctype html>
  <html>
    <head></head>
    <body></body>
  </html>`;

export const bootWindow: Window = domino.createWindow(templateDocument, 'http://localhost/');

const navigator = {
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

Object.defineProperties(bootWindow, {navigator: {get: () => navigator}});

// JavaScript programs are used to accessing these functions through the global window object.
// In the browser, window is equivalent to global 'this'. A good example is getComputedStyle.
// Strictly speaking, this is part of window, so if you are calling it you should explicitly
// use window.getComputedStyle(). But many people do not do this: they just call getComputedStyle.
// But window is not part of the global object when running in an angular-ssr context. So we must
// expose window methods as globals so that JavaScript libraries can reference them without an
// explicit window member access. Ultimately these operations will map to the current zone-
// specific window object from the zone mapper.
const environmentMethods = {
  alert(message: string) {},
  atob,
  btoa,
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean) {
    return window.addEventListener(type, listener, useCapture);
  },
  cancelAnimationFrame,
  caretRangeFromPoint(x: number, y: number) {
    return new Range(x, y);
  },
  blur() {
    window.blur();
  },
  createRange() {
    return new Range();
  },
  createTreeWalker(root: Node, whatToShow?: number, filter?: NodeFilter, entityReferenceExpansion?: boolean): TreeWalker {
    return document.createTreeWalker(root, whatToShow, filter, entityReferenceExpansion);
  },
  createAttribute(name: string): Attr {
    return document.createAttribute(name);
  },
  createAttributeNS(namespaceURI: string | null, qualifiedName: string): Attr {
    return document.createAttributeNS(namespaceURI, qualifiedName);
  },
  createComment(data: string): Comment {
    return document.createComment(data);
  },
  createDocumentFragment(): DocumentFragment {
    return document.createDocumentFragment();
  },
  createElement(tagName) {
    return document.createElement(tagName);
  },
  close() {
    window.close();
  },
  createTextNode(data?: string) {
    return document.createTextNode(data);
  },
  confirm: notImplemented,
  fetch,
  focus() {
    return window.focus();
  },
  global,
  getMatchedCSSRules: () => {
    return [];
  },
  getComputedStyle(element: Element) {
    return window.getComputedStyle(element);
  },
  getSelection() {
    return new Selection();
  },
  matchMedia: notImplemented,
  moveBy(x: number, y: number) {},
  moveTo(x: number, y: number) {},
  open(url: string, name: string, specs, replace) {
    return domino.createWindow(String(), url);
  },
  print() {},
  prompt: notImplemented,
  resizeBy(x: number, y: number) {},
  resizeTo(x: number, y: number) {},
  requestAnimationFrame,
  scroll() {},
  scrollTo(x: number, y: number) {},
  stop: notImplemented,
};

const environmentObjects = {
  Object,
  MutationObserver,
  Selection,
  Range,
  Reflect,
};

for (const k in environmentMethods) {
  if (typeof bootWindow[k] === 'undefined') {
    bootWindow[k] = environmentMethods[k];
  }
}

Object.assign(bootWindow, environmentObjects);

Object.assign(global, environmentMethods, environmentObjects);

function notImplemented() {
  throw new NotImplementedException();
}