import {ChangeDetectorRef, Component, OnInit} from '@angular/core';

import {ActivatedRoute} from '@angular/router';

import {Observable, Subscription} from 'rxjs';

import 'rxjs/add/operator/map';

import {LocaleService} from './locale.service';

@Component({
  selector: 'blog-component',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  private id: Observable<number>;

  private subscription: Subscription;

  constructor(
    public locale: LocaleService,
    private changeDetector: ChangeDetectorRef,
    route: ActivatedRoute
  ) {
    this.id = route.params.map(p => +p['id']);
  }

  ngOnInit() {
    this.subscription = this.locale.subject.subscribe(() => this.changeDetector.detectChanges());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}