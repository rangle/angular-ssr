import {Provider, RootRenderer} from '@angular/core';

import {RootRendererImpl} from './renderer';

export const PLATFORM_RENDERER_PROVIDERS: Array<Provider> = [
  {provide: RootRenderer, useClass: RootRendererImpl},
];