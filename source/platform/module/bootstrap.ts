import {NgModuleFactory, NgModuleRef} from '@angular/core';

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

export const bootstrapWithExecute = async <M, R>(platform: PlatformImpl, moduleFactory: NgModuleFactory<M>, execute: ModuleExecute<M, R>): Promise<R> => {
  const moduleRef = await platform.bootstrapModuleFactory<M>(moduleFactory);
  try {
    return await Promise.resolve(execute(moduleRef));
  }
  finally {
    moduleRef.destroy();
  }
};