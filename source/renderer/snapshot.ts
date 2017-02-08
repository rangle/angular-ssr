import {NgModuleRef} from '@angular/core';

import {
  RenderVariantOperation,
  SnapshotException
} from './types';

export const snapshot = async <M, V>(moduleRef: NgModuleRef<M>, operation: RenderVariantOperation<M, V>): Promise<string> => {
  return Promise.reject(new SnapshotException('Not implemented'));
}