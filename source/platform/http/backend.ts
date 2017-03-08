import {Injectable} from '@angular/core/index';

import {
  Connection,
  ConnectionBackend,
  Request
} from '@angular/http/index';

import {HttpConnection} from './connection';

@Injectable()
export class HttpBackend implements ConnectionBackend {
  createConnection(request: Request): Connection {
    return new HttpConnection(request);
  }
}