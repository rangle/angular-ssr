import 'zone.js/dist/zone-node';

import {
  NgModuleFactory,
  NgModuleRef,
  Type
} from '@angular/core/index';

import {PlatformImpl} from '../platform';
import {browserModuleToServerModule} from '../module';
import {platformNode} from '../factory';

export type ModuleExecute<M, R> = (moduleRef: NgModuleRef<M>) => R | Promise<R>;

const platform = <PlatformImpl> platformNode();

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

export const compileModule = async <M>(moduleType: Type<M>): Promise<NgModuleFactory<M>> => {
  return await platform.compileModule(browserModuleToServerModule(moduleType), []);
};

export const bootstrapModuleFactory = async <M, R>(moduleFactory: NgModuleFactory<M>, execute: ModuleExecute<M, R>): Promise<R> => {
  const moduleRef = await platform.bootstrapModuleFactory<M>(moduleFactory);
  try {
    return await Promise.resolve(execute(moduleRef));
  }
  finally {
    moduleRef.destroy();
  }
};