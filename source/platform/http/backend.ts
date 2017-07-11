import {ConnectionBackend, Connection, Request, XHRBackend} from '@angular/http';

import {HttpConnection} from './connection';

export class HttpBackendImpl implements ConnectionBackend {
  constructor(private backend: XHRBackend) {}

  createConnection(request: Request): Connection {
    return new HttpConnection(request, this.backend);
  }
}