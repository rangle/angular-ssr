class MutationObserverImpl implements MutationObserver {
  constructor(callback: MutationCallback) {}

  observe(target: Node, init: MutationObserverInit): void {}

  disconnect() {}

  takeRecords(): Array<MutationRecord> {
    return [];
  }
}

Object.assign(global, {MutationObserver: MutationObserverImpl});
