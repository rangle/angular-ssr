export class Cache<K, T> {
  private map = new Map<K, T>();

  query(key: K, miss: () => T): T {
    const cache = () => {
      const value = miss();

      this.map.set(key, value);

      return value;
    };

    return this.map.get(key) || cache();
  }

  set(key: K, value: T) {
    this.map.set(key, value);
  }

  write(...pairs: Array<[K, T]>) {
    for (const [key, value] of pairs) {
      this.map.set(key, value);
    }
  }

  clear() {
    this.map.clear();
  }
}