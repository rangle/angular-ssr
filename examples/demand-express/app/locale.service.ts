import {Injectable} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

import {CookieService} from './cookie.service';

@Injectable()
export class LocaleService {
  subject = new ReplaySubject<string>();

  constructor(private cookies: CookieService) {
    this.update(cookies.get<string>('locale') || navigator.language || 'en-US');
  }

  locale(locale?: Observable<string>): Observable<string> {
    if (locale) {
      const subscription = locale.subscribe(
        value => {
          this.update(value);

          subscription.unsubscribe();
        });
    }
    return this.subject;
  }

  private update(value: string) {
    this.subject.next(value);

    this.cookies.set('locale', value);
  }
}
