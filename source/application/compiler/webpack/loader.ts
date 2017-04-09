import {NgModuleFactory} from '@angular/core';

import {Configuration} from 'webpack';

import {CompilerException} from '../../../exception';
import {ModuleDeclaration} from './../../project';
import {ModuleLoader} from '../loader';

export class WebpackModuleLoader implements ModuleLoader {
  constructor(webpack: Configuration) {}

  load<M>(): Promise<NgModuleFactory<M>> {
    throw new CompilerException('Not implemented');
  }

  lazy<T>(module: ModuleDeclaration): Promise<T> {
    return Promise.reject(new CompilerException('Not implemented'));
  }

  dispose() {}
}