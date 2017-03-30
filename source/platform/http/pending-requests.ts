import {Injectable} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

@Injectable()
export class PendingRequests {
  private subject = new ReplaySubject<number>();

  increase() {
    this.subject.next(1);
  }

  decrease() {
    this.subject.next(-1);
  }

  requestsPending(): Observable<number> {
    return this.subject.scan((accumulator, v) => accumulator + v, 0);
  }
}
