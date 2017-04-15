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

export const bindInteractions = targetWindow => ({
  alert,
  blur: blur.bind(targetWindow),
  confirm,
  print,
  prompt,
  focus: focus.bind(targetWindow)
});