import {NgModuleFactory} from '@angular/core';

import {ModuleDeclaration} from '../project';

import {Disposable} from '../../disposable';

export interface ModuleLoader extends Disposable {
  load<M>(): Promise<NgModuleFactory<M>>;

  lazy<T>(module: ModuleDeclaration): Promise<T>;
}
