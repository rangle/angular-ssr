import {Injectable} from '@angular/core';

import {Request, XSRFStrategy} from '@angular/http';

@Injectable()
export class NoopXsrfStrategy implements XSRFStrategy {
  configureRequest(req: Request) {}
}