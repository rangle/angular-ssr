export interface RenderedDocument<V> {
  variant: V;
  document?: string;
  exception?: Error;
}