export interface RenderDocument<V> {
  // Complete rendered document
  document?: string;

  // The variant options that this document was rendered with
  variant: V;

  // Any exception which occurred while attempting to render this document
  exception?: Error;
}