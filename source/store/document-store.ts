import {LRUMap} from 'lru_map';

import {ApplicationBase} from '../application';
import {Snapshot} from '../snapshot';

import {defaultCacheSize} from './cache-size';

export class DocumentStore<M> {
  private cache: LRUMap<string, Snapshot<void>>;

  constructor(private application: ApplicationBase<any, M>, cacheSize = defaultCacheSize) {
    this.cache = new LRUMap<string, Snapshot<void>>(cacheSize);
  }

  get size(): number {
    return this.cache.size;
  }

  async load(uri: string): Promise<Snapshot<void>> {
    let snapshot = this.cache.get(uri);
    if (snapshot == null) {
      snapshot = await this.application.renderUri(uri);
      this.cache.set(uri, snapshot);
    }
    return snapshot;
  }

  reset() {
    this.cache.clear();
  }
}
