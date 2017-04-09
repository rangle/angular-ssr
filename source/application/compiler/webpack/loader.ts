import {NgModuleFactory} from '@angular/core';

import {Configuration} from 'webpack';

import {ModuleDeclaration} from './../../project';
import {ModuleLoader} from '../loader';
import {NotImplementedException} from '../../../exception';

export class WebpackModuleLoader implements ModuleLoader {
  constructor(webpack: Configuration) {}

  load<M>(): Promise<NgModuleFactory<M>> {
    throw new NotImplementedException();
  }

  lazy<T>(module: ModuleDeclaration): Promise<T> {
    return Promise.reject(new NotImplementedException());
  }

  dispose() {}
}