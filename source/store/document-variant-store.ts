import {LRUMap} from 'lru_map';

import {ApplicationBase} from '../application';
import {Snapshot} from '../snapshot';
import {Trie} from './trie';

import {defaultCacheSize} from './cache-size';

export class DocumentVariantStore<V> {
  private cache: LRUMap<string, Trie<V, Snapshot<V>>>;

  constructor(private application: ApplicationBase<V, any>, cacheSize = defaultCacheSize) {
    this.cache = new LRUMap<string, Trie<V, Snapshot<V>>>(cacheSize);
  }

  get size(): number {
    return this.cache.size;
  }

  async load(uri: string, variants: V): Promise<Snapshot<V>> {
    let snapshots = this.cache.get(uri);
    if (snapshots == null) {
      snapshots = new Trie<V, Snapshot<V>>();
      this.cache.set(uri, snapshots);
    }

    let cached = snapshots.query(variants);
    if (cached === undefined) {
      cached = await this.application.renderUri(uri, variants);
      snapshots.insert(variants, cached);
    }

    return cached;
  }

  reset() {
    this.cache.clear();
  }
}