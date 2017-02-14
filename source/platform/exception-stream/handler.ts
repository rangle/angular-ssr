import {Injectable, ErrorHandler, OnDestroy} from '@angular/core';

import {Subscription} from 'subscription';

export type ExceptionHandler = (exception: Error) => void;

@Injectable()
export class ErrorHandlerImpl extends ErrorHandler implements OnDestroy {
  constructor() {
    super(true);
  }

  private subscriptions = new Set<ExceptionHandler>();

  subscribe(handler: ExceptionHandler): Subscription {
    this.subscriptions.add(handler);

    return {
      unsubscribe: () => this.subscriptions.delete(handler)
    };
  }

  handleError(exception: Error) {
    this.subscriptions.forEach(subscription => subscription(exception));

    super.handleError(exception);
  }

  ngOnDestroy() {
    this.subscriptions.clear();
  }
}