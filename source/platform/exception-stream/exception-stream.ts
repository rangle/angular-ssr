import {ErrorHandler, Injectable, OnDestroy} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

import {ErrorHandlerImpl} from './handler';

import {Subscription} from 'subscription';

@Injectable()
export class ExceptionStream implements OnDestroy {
  private subscription: Subscription;

  private subject = new ReplaySubject<Error>();

  constructor(handler: ErrorHandler) {
    const handlerImpl = <ErrorHandlerImpl> handler;

    this.subscription = handlerImpl.subscribe(
      exception => {
        this.subject.next(exception);
      });
  }

  get stream(): Observable<Error> {
    return this.subject.asObservable();
  }

  ngOnDestroy() {
    this.subject.complete();

    this.subscription.unsubscribe();
  }
}
