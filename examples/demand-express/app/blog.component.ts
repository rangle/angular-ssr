import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';

import {ActivatedRoute} from '@angular/router';

import {Observable, Subscription} from 'rxjs';

import 'rxjs/add/operator/map';

import {LocaleService} from './locale.service';

@Component({
  selector: 'blog-component',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnDestroy {
  private id: Observable<number>;

  private locale: string;

  private subscription: Subscription;

  constructor(changeDetector: ChangeDetectorRef, localeService: LocaleService, route: ActivatedRoute) {
    this.id = route.params.map(p => +p['id']);

    this.locale = localeService.locale;

    this.subscription = localeService.subject.subscribe(() => {
      this.locale = localeService.locale;
      changeDetector.detectChanges();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}