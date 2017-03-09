export type CacheMiss<T> = () => T;

export class Cache<K, T> {
  private map = new Map<K, T>();

  query(key: K, miss: CacheMiss<T>): T {
    return this.map.get(key) || (() => {
      const value = miss();

      this.map.set(key, value);

      return value;
    })();
  }

  clear() {
    this.map.clear();
  }
}