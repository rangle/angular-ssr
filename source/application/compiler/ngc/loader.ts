import {NgModuleFactory} from '@angular/core';

import {Build} from './build';
import {CompilerException} from '../../../exception';
import {ModuleLoader} from '../loader';
import {ModuleDeclaration, Project} from '../../project';

export class NgcModuleLoader implements ModuleLoader {
  constructor(private project: Project, private build: Build) {}

  load<M>(): Promise<NgModuleFactory<M>> {
    return this.loadModule(this.project.applicationModule);
  }

  lazy<T>(module: ModuleDeclaration): Promise<T> {
    return this.loadModule(module);
  }

  dispose() {
    this.build.dispose();
  }

  private loadModule(module: ModuleDeclaration) {
    const [resolvedModule, symbol] = this.build.resolve(module);
    if (resolvedModule == null) {
      throw new CompilerException(`Cannot find a generated NgFactory matching the name ${module.source} with a symbol ${module.symbol}`);
    }

    const loadedModule = require(resolvedModule);

    if (symbol) {
      if (loadedModule[symbol] == null) {
        throw new CompilerException(`Module ${module.source} does not contain a symbol named ${symbol}`);
      }
      return loadedModule[symbol];
    }

    return loadedModule;
  }
}