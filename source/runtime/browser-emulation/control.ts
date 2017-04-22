import {NotSupportedException} from '../../exception';

function stop() {}

function close() {}

function captureEvents() {}

function open(url: string, name: string, specs, replace) {
  throw new NotSupportedException();
};

export const bindControl = (target: () => Window) => [false, {open, captureEvents, close: close.bind(target), stop}];