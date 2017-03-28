import {Injectable} from '@angular/core';

import {PlatformException} from '../../exception';

declare const Zone;

@Injectable()
export class ZoneProperties {
  parameter<T>(key: string): T {
    if (Zone.current == null) {
      throw new PlatformException('Zone parameter cannot be retrieved because this code is executing outside of a zone');
    }
    return Zone.current.get(key) || (() => {
      throw new PlatformException(`Cannot retrieve zone parameter value: ${key}`, null);
    })();
  }
}
