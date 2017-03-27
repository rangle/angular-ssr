import {Injectable} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

const pending = new ReplaySubject<number>();

pending.next(0);

const XmlHttpRequest = require('xhr2');

const dispatch = XmlHttpRequest.prototype._dispatchProgress;

let pendingCount = 0;

XmlHttpRequest.prototype._dispatchProgress = function (eventid: string) {
  switch (eventid) {
    case 'loadstart':
      pending.next(++pendingCount);
      break;
    case 'loadend':
      pending.next(--pendingCount);
      break;
  }
  return dispatch.apply(this, arguments);
};

@Injectable()
export class PendingRequests {
  get requestsPending(): Observable<number> {
    return pending;
  }
}