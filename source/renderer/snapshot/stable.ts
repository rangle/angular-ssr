import {NgModuleRef} from '@angular/core';

export const waitStable = <M>(moduleRef: NgModuleRef<M>): Promise<void> => {
  return Promise.reject(new Error('Not implemented'));
};