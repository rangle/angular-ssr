import {PlatformLocation} from '@angular/common';

import chalk = require('chalk');

import url = require('url');

import {LocationImpl} from '../location';
import {PendingRequests} from './pending-requests';
import {PlatformException} from '../../exception';
import {injectableFromZone} from '../zone/injector-map';

const XmlHttpRequest = require('xhr2');

const dispatch = XmlHttpRequest.prototype._dispatchProgress;

XmlHttpRequest.prototype._dispatchProgress = function (eventid: string) {
  const pendingRequests = injectableFromZone(Zone.current, PendingRequests);

  if (pendingRequests == null) {
    console.warn(chalk.yellow('Your application is conducting an HTTP request from outside of a zone!'));
    console.warn(chalk.yellow('This will probably cause your application to render before the request finishes'));

    return dispatch.apply(this, arguments);
  }

  switch (eventid) {
    case 'loadstart':
      pendingRequests.increase();
      break;
    case 'loadend':
      pendingRequests.decrease();
      break;
  }
  return dispatch.apply(this, arguments);
};

const send = XmlHttpRequest.prototype.send;

XmlHttpRequest.prototype.send = function (data) {
  this._url = adjustUri(this._url);

  return send.apply(this, arguments);
};

const adjustUri = (uri: URL) => {
  if (uri.host == null) { // relative path?
    const location = injectableFromZone(Zone.current, PlatformLocation) as LocationImpl;
    if (location) {
      return url.parse(url.resolve(location.href, uri.href));
    }
    else {
      try {
        return url.parse(url.resolve(Zone.current.name, uri.href));
      }
      catch (exception) {
        throw new PlatformException(`Cannot determine origin URI of zone: ${Zone.current.name}`, exception);
      }
    }
  }
  return uri;
};