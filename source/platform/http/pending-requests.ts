import {Injectable} from '@angular/core';

import {Observable, Subject} from 'rxjs';

@Injectable()
export class PendingRequests {
  private subject = new Subject<number>();

  constructor() {
    this.subject.next(0);
  }

  increase() {
    this.subject.next(1);
  }

  decrease() {
    this.subject.next(-1);
  }

  requestsPending(): Observable<number> {
    return this.subject.scan((acc, value) => acc + value);
  }
}
