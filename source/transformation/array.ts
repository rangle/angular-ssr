export const array = <T>(value: T | Array<T>): Array<T> => {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
};