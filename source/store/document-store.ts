import {LRUMap} from 'lru_map';

import {Application} from '../application';
import {Snapshot} from '../snapshot';

import {defaultCacheSize} from './cache-size';

export class DocumentStore {
  private cache: LRUMap<string, Snapshot<void>>;

  constructor(private application: Application<void | {}>, cacheSize = defaultCacheSize) {
    this.cache = new LRUMap<string, Snapshot<void>>(cacheSize);
  }

  get size(): number {
    return this.cache.size;
  }

  async load(uri: string): Promise<Snapshot<void>> {
    let snapshot = this.cache.get(uri);
    if (snapshot == null) {
      snapshot = <Snapshot<any>> await this.application.renderUri(uri);
      this.cache.set(uri, snapshot);
    }
    return snapshot;
  }

  reset() {
    this.cache.clear();
  }
}
