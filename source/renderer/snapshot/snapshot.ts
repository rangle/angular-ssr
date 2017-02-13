import {NgModuleRef} from '@angular/core';

import {SnapshotException} from './exception';

import {waitStable} from './stable';

export const snapshot = async <M>(moduleRef: NgModuleRef<M>): Promise<string> => {
  await waitStable(moduleRef);

  throw new SnapshotException('Not implemented');
}