export interface Snapshot<V> {
  exceptions: Array<Error>;
  criticalExceptions: Array<Error>;
  document: string;
  variance: V;
}