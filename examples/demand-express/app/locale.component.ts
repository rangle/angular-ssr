import {Component} from '@angular/core';

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
  constructor(public service: LocaleService) {}
}