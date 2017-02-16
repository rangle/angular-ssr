import {PlatformException} from 'exception';

declare const Zone;

export class CurrentZone {
  parameter<T>(key: string): T {
    return Zone.current.get(key) || (() => {
      throw new PlatformException(`Cannot retrieve zone parameter value: ${key}`, null);
    })();
  }
}
