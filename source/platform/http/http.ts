import {Injectable} from '@angular/core';

import {ConnectionBackend, Http, RequestOptionsArgs, RequestOptions, Request, Response} from '@angular/http';

import {Observable} from 'rxjs/Observable';

@Injectable()
export class HttpImpl extends Http {
  constructor(private backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
  console.error('CREATE REQUEST CON');
    return this.backend.createConnection(url).response;
  }
}