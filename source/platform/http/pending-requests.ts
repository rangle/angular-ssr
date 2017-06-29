import {Injectable} from '@angular/core';

import {Observable, BehaviorSubject} from 'rxjs';

@Injectable()
export class PendingRequests {
  private readonly subject = new BehaviorSubject<number>(0);

  increase() {
    this.subject.next(this.subject.value + 1);
  }

  decrease() {
    this.subject.next(this.subject.value - 1);
  }

  requestsPending(): Observable<number> {
    return Observable.from(this.subject);
  }
}
