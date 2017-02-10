import {Exception} from '../exception';

export class CloneException<T> extends Exception {
  public targetObject: T;

  constructor(targetObject: T, msg: string, innerException?: Error) {
    super(msg, innerException);

    this.targetObject = targetObject;
  }
}