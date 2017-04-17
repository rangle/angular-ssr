import {NotSupportedException} from '../../exception';

function stop() {}

function close() {}

function open(url: string, name: string, specs, replace) {
  throw new NotSupportedException();
};

export const bindControl = (target: () => Window) => ({open, close: close.bind(target), stop});