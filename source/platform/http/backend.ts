import {Injectable} from '@angular/core';

import {
  Connection,
  ConnectionBackend,
  Request
} from '@angular/http';

import {HttpConnection} from './connection';

@Injectable()
export class HttpBackend implements ConnectionBackend {
  createConnection(request: Request): Connection {
    return new HttpConnection(request);
  }
}