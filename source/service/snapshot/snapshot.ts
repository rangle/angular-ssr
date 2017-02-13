export interface Snapshot<V> {
  exceptions: Array<Error>;
  criticalExceptions: Array<Error>;
  renderedDocument: string;
  variant: V;
  applicationState?;
}