import {NgModuleRef, Type} from '@angular/core';

import {browserModuleToServerModule, platformNode} from 'platform';

import {ComposedTransition} from 'variance';

export type ModuleExecute<M, R> = (moduleRef: NgModuleRef<M>) => R | Promise<R>;

export const instantiateApplicationModule =
    async <M, R>(moduleType: Type<M>, transition: ComposedTransition, execute: ModuleExecute<M, R>): Promise<R> => {
  const platform = platformNode();
  try {
    const wrapper = browserModuleToServerModule(moduleType, transition);

    const moduleRef = await platform.bootstrapModule<M>(wrapper);
    try {
      return await Promise.resolve(execute(moduleRef));
    }
    finally {
      moduleRef.destroy();
    }
  }
  finally {
    platform.destroy();
  }
};