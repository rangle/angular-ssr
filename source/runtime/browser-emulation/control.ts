import {NotImplementedException} from './../../exception';

import domino = require('domino');

function stop() {
  throw new NotImplementedException();
}

function close() {
  this().close();
};

function open(url: string, name: string, specs, replace) {
  return domino.createWindow(String(), url);
};

export const bindControl = targetWindow => ({open, close: close.bind(targetWindow), stop});