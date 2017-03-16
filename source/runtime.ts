const domino = require('domino');

// These must be exposed because Angular uses them in its property decorators
Object.assign(global, {
  CustomEvent: domino.CustomEvent,
  Event: domino.Event,
  EventTarget: domino.EventTarget,
  MouseEvent: domino.MouseEvent,
  HTMLElement: domino.HTMLElement,
  UIEvent: domino.UIEvent,
});

require('mock-local-storage');
