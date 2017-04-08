export class TrieNode<T> {
  constructor(public key, public value?) {}

  insert(key, value?: T): TrieNode<T> {
    return this.children.get(key) || (() => {
      const node = new TrieNode(key, value);
      this.children.set(key, node);
      return node;
    })();
  }

  find(key): TrieNode<T> | null {
    return this.children.get(key);
  }

  leaf(): boolean {
    return this.value !== undefined;
  }

  protected children = new Map<any, TrieNode<T>>();
}

export class Trie<V, T> {
  private root = new TrieNode<T>(null);

  private keys: Array<string>;

  constructor(prototypical?: V) {
    if (prototypical) {
      this.keys = Object.keys(prototypical);
      this.keys.sort();
    }
  }

  insert(variant: V, value: T): TrieNode<T> {
    const keys = Object.keys(variant);
    keys.sort();

    if (this.keys == null) {
      this.keys = keys;
    }
    else {
      this.assert(keys);
    }

    let iterator = this.root;

    for (let i = 0; i < keys.length; ++i) {
      iterator = i === keys.length - 1
        ? iterator.insert(variant[keys[i]], value)
        : iterator.insert(variant[keys[i]]);
    }

    console.assert(iterator.leaf());

    return iterator;
  }

  query(variant: V): T | undefined {
    if (this.keys == null) {
      return undefined;
    }

    const keys = Object.keys(variant);
    keys.sort();

    this.assert(keys);

    let iterator = this.root;

    for (const k of keys) {
      iterator = iterator.find(variant[k]);
      if (iterator == null) {
        break;
      }
    }

    return iterator == null
      ? undefined
      : iterator.value;
  }

  private assert(keys: Array<string>) {
    const equal = (lhs: Array<string>, rhs: Array<string>): boolean => {
      if (lhs.length !== rhs.length) {
        return false;
      }
      return lhs.every((item, index) => item === rhs[index]);
    };

    if (equal(this.keys, keys) === false) {
      throw new Error(`A variant must always contain the same keys: ${this.keys.join(', ')}`);
    }
  }
}

