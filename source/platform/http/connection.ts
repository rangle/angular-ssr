import {Connection, ReadyState, Request, XHRBackend} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {adjustUri} from './uri';

import {scheduleTask} from './../zone/task';

export class HttpConnection implements Connection {
  response: Observable<Response>;

  private connection: Connection;

  constructor(public request: Request, backend: XHRBackend) {
    Object.assign(request, {url: adjustUri(request.url)});

    this.response = scheduleTask(() => {
      this.connection = backend.createConnection(this.request);

      return this.connection.response as Observable<any>;
    });
  }

  get readyState(): ReadyState {
    return this.connection ? this.connection.readyState : ReadyState.Unsent;
  }
}
