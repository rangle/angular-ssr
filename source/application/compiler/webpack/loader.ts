import {Configuration} from 'webpack';

import {NgModuleFactory} from '@angular/core';

import {ModuleDeclaration} from '../../project';
import {CompilerException} from '../../../exception';
import {ModuleLoader} from '../loader';

export class WebpackLoader implements ModuleLoader {
  constructor(private configuration: Configuration) {}

  load<M>(): Promise<NgModuleFactory<M>> {
    console.log('LOAD FROM', this.configuration);

    return Promise.reject(new CompilerException('Not implemented'));
  }

  lazy<T>(module: ModuleDeclaration): Promise<T> {
    return Promise.reject(new CompilerException('Not implemented'));
  }

  dispose() {}
}