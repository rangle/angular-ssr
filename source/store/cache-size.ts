// This is the default size of the LRU cache used for the document store implementations.
// You can override it in the constructor of DocumentStore or DocumentVariantStore.
export const defaultCacheSize = Math.pow(2, 16);