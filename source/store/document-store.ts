import {ApplicationBase} from '../application';
import {Snapshot} from '../snapshot';

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