import {NgModuleRef} from '@angular/core';

import {SnapshotException} from './exception';

import {RenderVariantOperation} from '../render/operation';

import {waitStable} from './stable';

export const snapshot = async <M, V>(moduleRef: NgModuleRef<M>, operation: RenderVariantOperation<M, V>): Promise<string> => {
  await waitStable(moduleRef);

  return Promise.reject(new SnapshotException('Not implemented'));
}