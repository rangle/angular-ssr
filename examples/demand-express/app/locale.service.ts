import {Injectable} from '@angular/core';

import {Subject} from 'rxjs';

@Injectable()
export class LocaleService {
  subject = new Subject<string>();

  constructor() {
    this.subject.next(this.locale);
  }

  get locale(): string {
    return this.extractFromCookie('locale') || (() => {
      this.locale = navigator.language;
      return navigator.language;
    })();
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
    document.cookie = `${key}=${value}`;
  }
}