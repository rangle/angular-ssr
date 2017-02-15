import {Type} from '@angular/core';

import {ApplicationBase} from './application';

import {CompilationException} from '../exception';

export interface Project {
  tsconfig: string; // path to the tsconfig.json file for this project
  ngModule: string; // path to the application root NgModule
}

export class ApplicationFromSource<V> extends ApplicationBase<V, any> {
  constructor(public project: Project) {
    super();
  }

  protected getModule(): Promise<Type<any>> {
    throw new CompilationException('Not implemented');
  }
}
