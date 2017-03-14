import {Provider} from '@angular/core';

import {SharedStylesToStyleTags} from './shared-tags';

import {SharedStyles} from './shared';

export const PLATFORM_STYLE_PROVIDERS: Array<Provider> = [
  {provide: SharedStyles, useClass: SharedStyles},
  {provide: SharedStylesToStyleTags, useClass: SharedStylesToStyleTags},
];
