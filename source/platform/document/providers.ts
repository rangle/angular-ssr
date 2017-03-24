import {Provider} from '@angular/core';

import {CurrentZone} from '../zone';
import {DocumentContainer} from './container';
import {TemplateDocument, RequestUri} from './tokens';

export const PLATFORM_DOCUMENT_PROVIDERS: Array<Provider> = [
  DocumentContainer,
  {
    provide: TemplateDocument,
    useFactory: (currentZone: CurrentZone) => {
      return currentZone.parameter<string>('documentTemplate');
    },
    deps: [CurrentZone],
  },
  {
    provide: RequestUri,
    useFactory: (currentZone: CurrentZone) => {
      return currentZone.parameter<string>('requestUri');
    },
    deps: [CurrentZone],
  },
];