import {NgModuleRef} from '@angular/core';

import {SnapshotException} from './exception';
import {Snapshot} from './snapshot';
import {waitStable} from './stable';

export const snapshot = async <M, V>(moduleRef: NgModuleRef<M>, variant: V): Promise<Snapshot<V>> => {
  await waitStable(moduleRef);

  throw new SnapshotException('Not implemented');
}