import {NgModuleRef} from '@angular/core';

import {
  RenderVariantOperation,
  SnapshotException
} from '../types';

import {waitStable} from './stable';

export const snapshot = async <M, V>(moduleRef: NgModuleRef<M>, operation: RenderVariantOperation<M, V>): Promise<string> => {
  await waitStable(moduleRef);

  return Promise.reject(new SnapshotException('Not implemented'));
}