export type Predicate<T> = (value: T) => boolean;

export const none: Predicate<ArrayLike<any> | string> = value => value == null || value.length === 0;