import {NgModuleFactory} from '@angular/core';

import {join} from 'path';

import {Configuration} from 'webpack';

import {ModuleDeclaration, Project} from './../../project';

import {ModuleLoader} from '../loader';

export class WebpackModuleLoader implements ModuleLoader {
  constructor(private project: Project, webpack: Configuration) {}

  load<M>(): Promise<NgModuleFactory<M>> {
    return this.lazy<NgModuleFactory<M>>(this.project.applicationModule);
  }

  lazy<T>(module: ModuleDeclaration): Promise<T> {
    const loaded = require(
      join(
        this.project.workingPath.toString(),
        this.project.basePath.toString(),
        `${module.source}.ts.js`));

    if (module.symbol) {
      return loaded[module.symbol];
    }
    else {
      return loaded;
    }
  }

  dispose() {
    if (this.project.workingPath) {
      this.project.workingPath.unlink();
      this.project.workingPath = null;
    }
  }
}