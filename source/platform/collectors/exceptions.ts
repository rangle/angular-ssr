import {Injectable, ErrorHandler, OnDestroy} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

@Injectable()
export class ExceptionCollector extends ErrorHandler implements OnDestroy {
  constructor() {super(true)}

  private subject = new ReplaySubject<Error>();

  observable(): Observable<Error> {
    return this.subject.asObservable();
  }

  handleError(exception: Error) {
    this.subject.next(exception);

    super.handleError(exception);
  }

  ngOnDestroy() {
    this.subject.complete();
    this.subject.unsubscribe();
  }
}