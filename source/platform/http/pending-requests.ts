import {Injectable} from '@angular/core';

import {Observable, Subject} from 'rxjs';

const pending = new Subject<number>();

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