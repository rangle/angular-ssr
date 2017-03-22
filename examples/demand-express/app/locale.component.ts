import {Component} from '@angular/core';

import {Observable} from 'rxjs';

import {LocaleService} from './locale.service';

@Component({
  selector: 'locale-selector',
  templateUrl: './locale.component.html',
  styles: [
    `select {
      margin-bottom: 1em;
    }`
  ]
})
export class LocaleComponent {
  public locale: Observable<string>;

  constructor(public service: LocaleService) {
    this.locale = service.observable();
  }
}