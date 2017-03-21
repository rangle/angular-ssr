import {ApplicationBase} from '../application';
import {Snapshot} from '../snapshot';
import {Trie} from './trie';

export class DocumentVariantStore<V, M> {
  private map = new Map<string, Trie<V, Snapshot<V>>>();

  constructor(private application: ApplicationBase<V, M>) {}

  async load(uri: string, variants: V): Promise<Snapshot<V>> {
    let snapshots = this.map.get(uri);
    if (snapshots == null) {
      snapshots = new Trie<V, Snapshot<V>>();
      this.map.set(uri, snapshots);
    }

    let cached = snapshots.query(variants);
    if (cached === undefined) {
      cached = await this.application.renderUri(uri, variants);
      snapshots.insert(variants, cached);
    }

    return cached;
  }
}

export class DocumentStore<M> {
  private map = new Map<string, Snapshot<void>>();

  constructor(private application: ApplicationBase<void, M>) {}

  async load(uri: string): Promise<Snapshot<void>> {
    let snapshot = this.map.get(uri);
    if (snapshot == null) {
      const snapshot = await this.application.renderUri(uri);
      this.map.set(uri, snapshot);
    }
    return snapshot;
  }
}

