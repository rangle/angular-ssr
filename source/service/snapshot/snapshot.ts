export interface Snapshot<V> {
  renderedDocument: string;
  variant: V;
  applicationState?;
}