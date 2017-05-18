const alert = (message: string) => {};

const confirm = (message) => true;

const print = () => {};

const prompt = (value: string) => String();

function blur() {}

function focus() {}

export const bindInteractions = (target: () => Window) => [false, {
  alert,
  blur: blur.bind(target),
  confirm,
  print,
  prompt,
  focus: focus.bind(target),
  setImmediate,
  clearImmediate,
}];