import {NgModuleRef} from '@angular/core';

import {SnapshotException} from './exception';
import {Snapshot} from './snapshot';
import {StateReader} from '../operation';
import {waitUntilStable} from './stable';

export const takeSnapshot =
    async <M, V>(moduleRef: NgModuleRef<M>, variant: V, stateReader?: StateReader): Promise<Snapshot<V>> => {
  await waitUntilStable(moduleRef);

  throw new SnapshotException('Not implemented');
}