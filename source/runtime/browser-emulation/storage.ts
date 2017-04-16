export class MemoryStorage {
  private readonly map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  key(n: number): string {
    return Array.from(this.map.keys())[n];
  }

  setItem(key: string, value: string) {
    this.map.set(key, value);
  }

  getItem(key: string): string {
    return this.map.get(key);
  }

  removeItem(key: string) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

const createStorage = () => // Storage object supports [] operator, so we do too, using Proxy
  new Proxy(new MemoryStorage(), {
    get: (target: MemoryStorage, name: string) => {
      if (name in target) {
        return target[name];
      }
      return target.getItem(name);
    },
    set: (target: MemoryStorage, name: string, value) => {
      if (name in target) {
        target[name] = value;
      }
      else {
        target.setItem(name, value);
      }
      return true;
    }
  });

export const bindStorage = (target: () => Window) => ({localStorage: createStorage(), sessionStorage: createStorage()});