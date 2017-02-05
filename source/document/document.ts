export interface RenderedDocument<V> {
  // Complete rendered document
  document?: string;

  // Fallback client-side document template (if exception is non-null)
  fallback?: string;

  // The variant options that this document was rendered with
  variant: V;

  // Any exception which occurred while attempting to render this document
  exception?: Error;
}