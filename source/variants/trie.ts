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

  insert(variant: V, value: T): TrieNode<T> {
    const keys = Object.keys(variant);
    keys.sort();

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
    const keys = Object.keys(variant);
    keys.sort();

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
}
