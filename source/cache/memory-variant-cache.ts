import {Application} from '../application';
import {Cache} from './cache';
import {LRUMap} from 'lru_map';
import {Pair} from './pair';
import {Snapshot} from '../snapshot';
import {Trie} from './trie';

export class MemoryVariantCache<V> implements Cache {
  private cache: LRUMap<string, Trie<V, Pair<V>>>;

  constructor(
    private application: Application<V>,
    private cacheSize = 1 << 16,
    private ttl = 1 << 18
  ) {
    this.cache = new LRUMap<string, Trie<V, Pair<V>>>(this.cacheSize);
  }

  async get(uri: string, variants: V): Promise<Snapshot<V>> {
    let snapshots = this.cache.get(uri);
    if (snapshots == null) {
      snapshots = new Trie<V, Pair<V>>();

      this.cache.set(uri, snapshots);
    }

    let cached = snapshots.query(variants);
    if (cached == null || (Date.now() - cached.time) >= this.ttl) {
      cached = {
        snapshot: await this.application.renderUri(uri, variants),
        time: Date.now(),
      };

      snapshots.insert(variants, cached);
    }

    return cached.snapshot;
  }

  has(uri: string, variants: V): boolean {
    let snapshots = this.cache.get(uri);
    if (snapshots != null) {
      return snapshots.query(variants) != null;
    }
    return false;
  }
}