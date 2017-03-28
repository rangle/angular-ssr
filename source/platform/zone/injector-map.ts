import {Injector, Type} from '@angular/core';

const map = new Map<Zone, Injector>();

export const mapZoneToInjector = (zone: Zone, injector: Injector): () => void => {
  map.set(zone, injector);

  return () => map.delete(zone);
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

export const injectableFromZone = <T>(zone: Zone, token: Type<T>): T => {
  const injector = zoneToInjector(zone);
  if (injector) {
    return injector.get(token, null);
  }
  return null;
}
