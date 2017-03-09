import {Provider} from '@angular/core/index';

import {DocumentStyles} from './document';

import {SharedStyles} from './shared';

export const PLATFORM_STYLE_PROVIDERS: Array<Provider> = [
  {provide: SharedStyles, useClass: SharedStyles},
  {provide: DocumentStyles, useClass: DocumentStyles},
];
