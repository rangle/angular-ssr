import {Injectable} from '@angular/core';

import {PlatformLocation} from '@angular/common';

import {Observable, ReplaySubject} from 'rxjs';

import url = require('url');

import {LocationImpl} from '../location';

import {PlatformException} from '../../exception';

import {injectableFromZone} from '../zone';

const pending = new ReplaySubject<number>();

pending.next(0);

@Injectable()
export class PendingRequests {
  get requestsPending(): Observable<number> {
    return pending;
  }
}

const XmlHttpRequest = require('xhr2');

let pendingCount = 0;

const dispatch = XmlHttpRequest.prototype._dispatchProgress;

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

const send = XmlHttpRequest.prototype.send;

XmlHttpRequest.prototype.send = function (data) {
  if (this._url.host == null) { // relative path?
    const location = injectableFromZone(Zone.current, PlatformLocation) as LocationImpl;
    if (location) {
      this._url = url.parse(url.resolve(location.href, this._url.href));
    }
    else {
      try {
        this._url = url.parse(url.resolve(Zone.current.name, this._url.href));
      }
      catch (exception) {
        throw new PlatformException(`Cannot determine origin URI of zone: ${Zone.current.name}`);
      }
    }
  }

  return send.apply(this, arguments);
}
