import {NgModuleRef} from '@angular/core';

import {SnapshotException} from './types';

export const snapshot = async <M>(moduleRef: NgModuleRef<M>): Promise<string> => {
  return Promise.reject(new SnapshotException('Not implemented'));
}