export type Predicate<T> = (value: T) => boolean;

export const none: Predicate<Array<any> | string> = value => value == null || value.length === 0;