import {Injectable} from '@angular/core';

import {Observable, ReplaySubject} from 'rxjs';

@Injectable()
export class LocaleService {
  subject = new ReplaySubject<string>();

  constructor() {
    const initial = () => {
      return this.extractFromCookie('locale') || (() => {
        this.locale = navigator.language;
        return navigator.language;
      })();
    }

    this.subject.next(initial());
  }

  observable(): Observable<string> {
    return this.subject.asObservable();
  }

  set locale(locale: string) {
    this.setInCookie('locale', locale);

    this.subject.next(locale);
  }

  private getCookies(): Map<string, string> {
    return new Map<string, string>(<any> (document.cookie || String()).split(/; /g).map(c => c.split(/=/)));
  }

  private extractFromCookie(key: string): string {
    return this.getCookies().get(key);
  }

  private setInCookie(key: string, value: string) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    document.cookie = `${key}=${value}`;
  }
}