Object.assign(global, {
  requestAnimationFrame(callback: (ms: number) => void) {
    return setImmediate(() => callback(Date.now()));
  },
  cancelAnimationFrame(id) {
    clearImmediate(id);
  }
});
