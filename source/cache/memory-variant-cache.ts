import {LRUMap} from 'lru_map';

import {Application} from '../application';
import {Cache} from './cache';
import {Snapshot} from '../snapshot';
import {Trie} from './trie';

export class MemoryVariantCache<V> implements Cache {
  private cache: LRUMap<string, Trie<V, Snapshot<V>>>;

  constructor(private application: Application<V>, cacheSize = 1 << 16) {
    this.cache = new LRUMap<string, Trie<V, Snapshot<V>>>(cacheSize);
  }

  async load(uri: string, variants: V): Promise<Snapshot<V>> {
    let snapshots = this.cache.get(uri);
    if (snapshots == null) {
      snapshots = new Trie<V, Snapshot<V>>();

      this.cache.set(uri, snapshots);
    }

    let cached = snapshots.query(variants);
    if (cached == null) {
      cached = await this.application.renderUri(uri, variants);

      snapshots.insert(variants, cached);
    }

    return cached;
  }

  has(uri: string, variants: V): boolean {
    let snapshots = this.cache.get(uri);
    if (snapshots != null) {
      return snapshots.query(variants) != null;
    }
    return false;
  }
}