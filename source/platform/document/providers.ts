import {Provider} from '@angular/core';

import {DocumentContainer} from './container';
import {TemplateDocument, RequestUri} from './tokens';

export const PLATFORM_DOCUMENT_PROVIDERS: Array<Provider> = [
  DocumentContainer,
  {
    provide: TemplateDocument,
    useFactory: () => Zone.current.get('documentTemplate'),
  },
  {
    provide: RequestUri,
    useFactory: () => Zone.current.get('requestUri'),
  },
];