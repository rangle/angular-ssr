import {Provider} from '@angular/core';

import {DocumentContainer} from './container';
import {TemplateDocument, RequestUri} from './tokens';
import {ZoneProperties} from '../zone/properties';

export const PLATFORM_DOCUMENT_PROVIDERS: Array<Provider> = [
  DocumentContainer,
  {
    provide: TemplateDocument,
    useFactory: (zone: ZoneProperties) => {
      return zone.parameter<string>('documentTemplate');
    },
    deps: [ZoneProperties],
  },
  {
    provide: RequestUri,
    useFactory: (zone: ZoneProperties) => {
      return zone.parameter<string>('requestUri');
    },
    deps: [ZoneProperties],
  },
];