import {Provider} from '@angular/core';

import {ModuleLoader} from './loader';

import {ServerPlatform} from '../../platform/platform';

export interface ApplicationCompiler {
  createPlatform(providers?: Array<Provider>): ServerPlatform;

  compile(): Promise<ModuleLoader>;
}