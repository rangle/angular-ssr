import 'zone.js/dist/zone-node';

import {NgModuleRef, Type} from '@angular/core';

import {platformNode} from '../factory';

export type ModuleExecute<M, R> = (moduleRef: NgModuleRef<M>) => R | Promise<R>;

const platform = platformNode();

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

export const bootstrapApplicationWithExecute = async <M, R>(moduleType: Type<M>, execute: ModuleExecute<M, R>): Promise<R> => {
  const moduleRef = await platform.bootstrapModule<M>(moduleType);
  try {
    return await Promise.resolve(execute(moduleRef));
  }
  finally {
    moduleRef.destroy();
  }
};
