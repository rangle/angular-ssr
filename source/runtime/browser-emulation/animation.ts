const requestAnimationFrame = (callback: (ms: number) => void) => {
  return setImmediate(() => callback(Date.now()));
};

const cancelAnimationFrame = (id) => clearImmediate(id);

export const bindAnimation = (target: () => Window) => [true, {cancelAnimationFrame, requestAnimationFrame}];