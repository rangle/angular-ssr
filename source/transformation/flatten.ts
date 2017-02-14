export const flatten = <T>(source: Array<any>): Array<T> => {
  return source.reduce((p, c) => [...p, ...(Array.isArray(c) ? flatten<T>(c) : [c])], new Array<T>());
};