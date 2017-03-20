import {
  NgModuleFactory,
  NgModuleRef,
  Type
} from '@angular/core';

import {PlatformImpl} from '../platform';

export type ModuleExecute<M, R> = (moduleRef: NgModuleRef<M>) => R | Promise<R>;

declare const Zone;

export const forkZone = <R>(documentTemplate: string, requestUri: string, execute: () => R): R => {
  const zone = Zone.current.fork({
    name: requestUri,
    properties: {
      documentTemplate,
      requestUri,
    }
  });

  return zone.run(execute);
}

export const compileModule = async <M>(platform: PlatformImpl, moduleType: Type<M>): Promise<NgModuleFactory<M>> => {
  return await platform.compileModule(moduleType, []);
};

export const bootstrapWithExecute = async <M, R>(platform: PlatformImpl, moduleFactory: NgModuleFactory<M>, execute: ModuleExecute<M, R>): Promise<R> => {
  const moduleRef = await platform.bootstrapModuleFactory<M>(moduleFactory);
  try {
    return await Promise.resolve(execute(moduleRef));
  }
  finally {
    setImmediate(() => moduleRef.destroy());
  }
};