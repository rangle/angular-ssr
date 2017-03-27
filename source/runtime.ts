const domImpl = require('domino/lib/impl');

const MutationConstants = require('domino/lib/MutationConstants');

Object.assign(global, domImpl);

Object.assign(global, {XMLHttpRequest: require('xhr2')});

Object.assign(global, {
  requestAnimationFrame(callback: (ms: number) => void) {
    return setImmediate(() => callback(Date.now()));
  },
  cancelAnimationFrame(id) {
    clearImmediate(id);
  }
});

class MutationObserverImpl implements MutationObserver {
  constructor(callback: MutationCallback) {}

  observe(target: Node, init: MutationObserverInit): void {}

  disconnect() {}

  takeRecords(): Array<MutationRecord> {
    return [];
  }
}

Object.assign(global, {MutationObserver: MutationObserverImpl});

Object.assign(global, {CSS: null});

// These will be overwritten with the zone mapper
Object.assign(global, {document: {}});
Object.assign(global, {window: global});

require('mock-local-storage');
