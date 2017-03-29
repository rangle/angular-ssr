import 'zone.js';

import {Injector, InjectionToken, Type} from '@angular/core';

import {PlatformException} from '../../exception';

const map = new Map<Zone, Injector>();

export const mapZoneToInjector = (zone: Zone, injector: Injector): () => void => {
  if (map.get(zone)) {
    throw new PlatformException(`Zone ${zone.name} is mapped to an existing injector and a zone can not be mapped to more than one injector`);
  }

  map.set(zone, injector);

  return () => {
    map.delete(zone);
  };
};

export const zoneToInjector = (zone: Zone) => {
  for (let iterator: Zone = zone; iterator; iterator = iterator.parent) {
    const injector = map.get(iterator);
    if (injector) {
      return injector;
    }
  }
  return undefined;
}

export const injectableFromZone = <T>(zone: Zone, token: Type<T> | InjectionToken<T> | Function): T => {
  const injector = zoneToInjector(zone);
  if (injector) {
    return injector.get(token, null);
  }
  return null;
}
