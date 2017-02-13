import {NgModuleRef} from '@angular/core';

export const waitUntilStable = async <M>(moduleRef: NgModuleRef<M>): Promise<void> => {
  throw new Error('Not implemented');
};