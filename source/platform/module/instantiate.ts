import {NgModuleRef, Type} from '@angular/core';

import {platformNode} from 'platform';

import {ComposedTransition} from 'variance';

import {TemplateDocument, RequestUri} from '../dom';

export type ModuleExecute<M, R> = (moduleRef: NgModuleRef<M>) => R | Promise<R>;

export const instantiateApplicationModule =
    async <M, R>(moduleType: Type<M>, documentTemplate: string, requestUri: string, execute: ModuleExecute<M, R>): Promise<R> => {
  const platform = platformNode([
    {provide: TemplateDocument, useValue: documentTemplate},
    {provide: RequestUri, useValue: requestUri},
  ]);

  try {
    const moduleRef = await platform.bootstrapModule<M>(moduleType);
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