import {Provider} from '@angular/core/index';

import {
  BaseResponseOptions,
  BaseRequestOptions,
  ConnectionBackend,
  ResponseOptions,
  RequestOptions,
} from '@angular/http/index';

import {HttpBackend} from './backend';

export const PLATFORM_HTTP_PROVIDERS: Array<Provider> = [
  {provide: ConnectionBackend, useClass: HttpBackend},
  {provide: RequestOptions, useClass: BaseRequestOptions},
  {provide: ResponseOptions, useClass: BaseResponseOptions},
];