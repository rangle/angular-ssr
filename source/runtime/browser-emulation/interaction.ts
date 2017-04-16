import {NotImplementedException} from '../../exception';

const alert = (message: string) => {};

const confirm = (message) => {
  throw new NotImplementedException();
}

const print = () => {};

const prompt = (value: string) => String();

function blur() {
  this().blur();
}

function focus() {
  this().focus();
}

export const bindInteractions = (target: () => Window) => ({
  alert,
  blur: blur.bind(target),
  confirm,
  print,
  prompt,
  focus: focus.bind(target)
});