export interface Snapshot<V> {
  exceptions: Array<Error>;
  criticalExceptions: Array<Error>;
  document: string;
  variant: V;
}