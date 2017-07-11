import {PlatformLocation} from '@angular/common';

import {LocationImpl} from '../location/location';

import {PlatformException} from '../../exception';

import {injectableFromZone} from '../zone';

import url = require('url');

export const adjustUri = (uri: string): string => {
  const parsed = url.parse(uri);

  if (parsed.host == null) { // relative path?
    const location = injectableFromZone(Zone.current, PlatformLocation) as LocationImpl;
    if (location) {
      return url.resolve(location.href, parsed.href);
    }
    else {
      try {
        return url.resolve(Zone.current.name, parsed.href);
      }
      catch (exception) {
        throw new PlatformException(`Cannot determine origin URI of zone: ${Zone.current.name}`, exception);
      }
    }
  }
  return uri;
};