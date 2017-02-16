import {Exception} from 'exception';

export class TransitionException extends Exception {
  constructor(innerException: Error, key: string, values) {
    super(format(key, values, innerException), innerException);
  }
}

const format = (key: string, values, exception: Error): string => {
  const vs = JSON.stringify(values, null, 2);

  return `Failed to execute variant state transition: ${key}: ${exception.message} (variant options: ${vs})`;
};