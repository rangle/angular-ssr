export const requestAnimationFrame = (callback: (ms: number) => void) => {
  return setImmediate(() => callback(Date.now()));
};

export const cancelAnimationFrame = (id) => clearImmediate(id);