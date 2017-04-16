export class MutationObserver implements MutationObserver {
  constructor(callback: MutationCallback) {}

  observe(target: Node, init: MutationObserverInit): void {}

  disconnect() {}

  takeRecords(): Array<MutationRecord> {
    return [];
  }
}

export const bindMutation = (target: () => Window) => ({MutationObserver});