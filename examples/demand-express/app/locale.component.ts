import {ChangeDetectorRef, Component} from '@angular/core';

import {Subscription} from 'rxjs';

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
  public locale: string;

  private subscription: Subscription;

  constructor(changeDetector: ChangeDetectorRef, public service: LocaleService) {
    this.locale = service.locale;

    this.subscription = service.subject.subscribe(locale => {
      this.locale = locale;
      changeDetector.detectChanges();
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}