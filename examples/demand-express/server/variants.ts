import {Injectable} from '@angular/core';

import {StateTransition, VariantsMap} from 'angular-ssr';

import {LocaleService} from '../app/locale.service';

@Injectable()
export class TransitionLocale implements StateTransition<string> {
  constructor(private service: LocaleService) {}

  execute(locale: string) {
    this.service.locale = locale;
  }
}

export interface Variants {
  locale: string;
}

export const variants: VariantsMap = {
  locale: {
    values: ['en-US', 'fr-FR'],
    transition: TransitionLocale
  }
};
