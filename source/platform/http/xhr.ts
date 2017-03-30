import {Injectable} from '@angular/core';

import {PlatformLocation} from '@angular/common';

import {Observable, ReplaySubject} from 'rxjs';

import url = require('url');

import {LocationImpl} from '../location';

import {injectableFromZone} from '../zone';

const pending = new ReplaySubject<number>();

pending.next(0);

const XmlHttpRequest = require('xhr2');

let pendingCount = 0;

const send = XmlHttpRequest.prototype.send;

XmlHttpRequest.prototype.send = function (data) {
  const location = injectableFromZone(Zone.current, PlatformLocation) as LocationImpl;
  if (location) {
    this._url = url.parse(url.resolve(location.href, this._url.href)); // relative to absolute
  }
  else {
    if (this._url.protocol == null) {
      this._url.protocol = 'http:';
    }

    if (this._url.hostname == null) {
      this._url.hostname = 'localhost';
    }

    if (this._url.port == null) {
      this._url.port = 80;
    }
  }

  return send.apply(this, arguments);
}

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

@Injectable()
export class PendingRequests {
  get requestsPending(): Observable<number> {
    return pending;
  }
}