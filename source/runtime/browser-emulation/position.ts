const moveBy = (x: number, y: number) => {};

const moveTo = (x: number, y: number) => {};

const resizeBy = (x: number, y: number) => {};

const resizeTo = (x: number, y: number) => {};

const scroll = () => {};

const scrollTo = () => {};

export const bindPosition = targetWindow => ({
  moveBy,
  moveTo,
  resizeBy,
  resizeTo,
  scroll,
  scrollTo
});