export enum ConsoleType {
  Assertion,
  Log,
  Information,
  Warning,
  Error,
  InteractiveObject,
  Time,
  TimeEnd,
  Trace,
}

export interface ConsoleLog {
  type: ConsoleType;
  date: Date;
  args: Array<any>;
}