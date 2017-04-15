import domino = require('domino');

import {bindAnimation} from './animation';
import {bindBase64} from './base64';
import {bindControl} from './control';
import {bindEvents} from './events';
import {bindInteractions} from './interaction';
import {bindMutation} from './mutation-observer';
import {bindPosition} from './position';
import {bindSelection} from './selection';
import {bindStyle} from './style';
import {bindTypes} from './types';

export const upgradeWindow = (target, window: () => Window): void => {
  const fills = {
    ...domino.impl,
    ...bindTypes,
    ...bindAnimation(window),
    ...bindBase64(window),
    ...bindControl(window),
    ...bindEvents(window),
    ...bindInteractions(window),
    ...bindMutation(window),
    ...bindPosition(window),
    ...bindSelection(window),
    ...bindStyle(window),
  };

  for (const k of Object.keys(fills).filter(k => typeof target[k] === 'undefined')) {
    target[k] = fills[k];
  }
};

export const createModernWindow = (template: string, uri: string): Window => {
  const newWindow = domino.createWindow(template, uri);

  upgradeWindow(newWindow, () => newWindow);

  return newWindow;
};
