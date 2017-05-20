import {Application} from '../application';
import {Cache} from './cache';
import {LRUMap} from 'lru_map';
import {Pair} from './pair';
import {Snapshot} from '../snapshot';

export class MemoryCache implements Cache {
  private cache: LRUMap<string, Pair<void>>;

  constructor(
    private application: Application<void | {}>,
    private cacheSize = 1 << 16,
    private ttl = 1 << 18,
  ) {
    this.cache = new LRUMap<string, Pair<void>>(this.cacheSize);
  }

  async get(uri: string): Promise<Snapshot<void>> {
    let pair = this.cache.get(uri);
    if (pair == null || (Date.now() - pair.time) >= this.ttl) {
      pair = {
        snapshot: await this.application.renderUri(uri) as Snapshot<void>,
        time: Date.now()
      };
      this.cache.set(uri, pair);
    }
    return pair.snapshot;
  }

  has(uri: string): boolean {
    return this.cache.get(uri) != null;
  }
}
