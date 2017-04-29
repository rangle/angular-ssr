import {Injectable} from '@angular/core';

import {Http} from '@angular/http';

import {Observable} from 'rxjs';

import {Blog} from './blog.model';

@Injectable()
export class BlogService {
  constructor(private http: Http) {}

  load(locale: string): Observable<Array<Blog>> {
    return this.http.get(`http://localhost:8081/${locale}`).map(r => r.json());
  }
}