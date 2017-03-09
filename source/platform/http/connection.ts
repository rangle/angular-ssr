import fetch from 'node-fetch';

import {
  Connection,
  Headers,
  ReadyState,
  Response,
  Request,
  RequestMethod,
  ResponseType,
} from '@angular/http';

import {ReplaySubject} from 'rxjs/ReplaySubject';

export class HttpConnection extends Connection {
  response: ReplaySubject<Response>;

  constructor(request: Request) {
    super();

    this.request = request;
    this.readyState = ReadyState.Unsent;
    this.response = new ReplaySubject<Response>();

    setImmediate(() => this.send());
  }

  private async send() {
    this.readyState = ReadyState.Open;

    const headers =
      this.request.headers
        ? this.request.headers.toJSON()
        : {};

    const response = await fetch(this.request.url, {
      body: this.request.getBody(),
      headers,
      method: RequestMethod[this.request.method].toUpperCase(),
    });

    this.readyState = ReadyState.Done;

    this.response.next(await this.transformResponse(response));
  }

  private async transformResponse(response) {
    const transformed = Object.assign({}, response, {
      headers: new Headers(response.headers),
      bytesLoaded: undefined,
      totalBytes: undefined,
      type: ResponseType[response.type],
    });

    const responseType = (property: string) => {
      return response[property]()
        .then(value => {
          transformed[property] = () => value;
        })
        .catch(exception => {
          transformed[property] = () => {throw exception};
        });
    };

    await Promise.all([
      responseType('json'),
      responseType('text'),
      responseType('arrayBuffer'),
      responseType('blob')
    ]);

    return transformed;
  }
}