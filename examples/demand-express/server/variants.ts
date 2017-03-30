import {Injectable} from '@angular/core';

import {StateTransition} from 'angular-ssr';

import {LocaleService} from '../app/locale.service';

@Injectable()
export class TransitionLocale implements StateTransition<string> {
  constructor(private service: LocaleService) {}

  transition(locale: string) {
    this.service.locale(locale);
  }
}

export interface Variants {
  locale: string;
}
