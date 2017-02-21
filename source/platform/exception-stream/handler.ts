import {Injectable, ErrorHandler, OnDestroy} from '@angular/core';

import {Publisher, Subscription} from '../../publisher';

export type ExceptionHandler = (exception: Error) => void;

@Injectable()
export class ErrorHandlerImpl extends ErrorHandler implements OnDestroy {
  constructor() {
    super(true);
  }

  private subscriber = new Publisher<ExceptionHandler>();

  subscribe(handler: ExceptionHandler): Subscription {
    return this.subscriber.subscribe(handler);
  }

  handleError(exception: Error) {
    this.subscriber.publish(exception);

    super.handleError(exception);
  }

  ngOnDestroy() {
    this.subscriber.dispose();
  }
}