import {NgModuleFactory} from '@angular/core';

import {ApplicationModule} from '../project';

import {Disposable} from '../../disposable';

export interface ModuleLoader extends Disposable {
  load<M>(): Promise<NgModuleFactory<M>>;

  lazy<T>(module: ApplicationModule): Promise<T>;
}
