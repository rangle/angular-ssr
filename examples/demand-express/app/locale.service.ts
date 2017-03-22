import {Injectable} from '@angular/core';

import {Subject} from 'rxjs';

@Injectable()
export class LocaleService {
  subject = new Subject<void>();

  get locale(): string {
    return this.extractFromCookie('locale') || (() => {
      this.setInCookie('locale', navigator.language);
      return navigator.language;
    })();
  }

  set locale(locale: string) {
    this.setInCookie('locale', locale);

    this.subject.next(void 0);
  }

  private getCookies(): Map<string, string> {
    return new Map<string, string>(<any> document.cookie.split(/; /g).map(c => c.split(/=/)));
  }

  private extractFromCookie(key: string): string {
    return this.getCookies().get(key);
  }

  private setInCookie(key: string, value: string) {
    const cookies = this.getCookies();
    cookies.set(key, value);

    document.cookie = `${key}=${value}`;
  }
}