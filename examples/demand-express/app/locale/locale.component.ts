import {Component} from '@angular/core';

import {Observable} from 'rxjs';

import {LocaleService} from './locale.service';

@Component({
  selector: 'locale-selector',
  templateUrl: './locale.component.html',
  styles: [`
    :host {
      margin: 2em;
    }
    locale-selector {
      padding-top: 1em;
    }`
  ]
})
export class LocaleComponent {
  public locale: Observable<string>;

  constructor(public service: LocaleService) {
    this.locale = service.locale();
  }
}