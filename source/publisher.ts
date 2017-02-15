import {Disposable} from './disposable';

export interface Subscription {
  unsubscribe(): void;
}

export class Publisher<F extends Function> implements Disposable {
  private set = new Set<F>();

  subscribe(handler: F): Subscription {
    this.set.add(handler);

    return {
      unsubscribe: () => this.set.delete(handler)
    };
  }

  publish(...args: Array<any>) {
    this.set.forEach(handler => handler(...args));
  }

  dispose() {
    this.set.clear();
  }
}