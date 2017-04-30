import {Injectable} from '@angular/core';

import {Http} from '@angular/http';

import {Observable} from 'rxjs';

import {Blog} from './model';

@Injectable()
export class BlogService {
  constructor(private http: Http) {}

  load(locale: string): Observable<ArrayLike<Blog>> {
    return this.http.get('https://raw.githubusercontent.com/clbond/angular-ssr/master/examples/demand-express/mock-content.json').map(r => r.json()).map(c => c[locale]);
  }
}