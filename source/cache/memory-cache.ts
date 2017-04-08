import {LRUMap} from 'lru_map';

import {Application} from '../application';
import {Cache} from './cache';
import {Snapshot} from '../snapshot';

export class MemoryCache implements Cache {
  private cache: LRUMap<string, Snapshot<void>>;

  constructor(private application: Application<void | {}>, cacheSize = 1 << 16) {
    this.cache = new LRUMap<string, Snapshot<void>>(cacheSize);
  }

  async load(uri: string): Promise<Snapshot<void>> {
    let snapshot = this.cache.get(uri);
    if (snapshot == null) {
      snapshot = <Snapshot<any>> await this.application.renderUri(uri);
      this.cache.set(uri, snapshot);
    }
    return snapshot;
  }

  has(uri: string): boolean {
    return this.cache.get(uri) != null;
  }
}
