import {install} from './transpile/install';

import {RuntimeException} from './exception';

try {
  install();
}
catch (exception) {
  throw new RuntimeException('Failed to install runtime transpiler', exception);
}

const {
  CustomEvent,
  Event,
  EventTarget,
  MouseEvent,
  HTMLElement,
  UIEvent,
} = require('domino');

// These must be exposed because Angular uses them in its property decorators
Object.assign(global, {
  CustomEvent,
  Event,
  EventTarget,
  MouseEvent,
  HTMLElement,
  UIEvent,
});

require('mock-local-storage');
