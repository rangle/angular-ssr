import {Provider} from '@angular/core';

import {PendingRequests} from './pending-requests';

export const PLATFORM_HTTP_PROVIDERS: Array<Provider> = [
  {provide: PendingRequests, useClass: PendingRequests}
];
