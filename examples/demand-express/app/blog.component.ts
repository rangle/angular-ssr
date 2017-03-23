import {Component} from '@angular/core';

import {ActivatedRoute} from '@angular/router';

import {Observable} from 'rxjs';

import 'rxjs/add/operator/map';

import {LocaleService} from './locale.service';

@Component({
  selector: 'blog-component',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {
  private id: Observable<number>;

  private locale: Observable<string>;

  constructor(localeService: LocaleService, route: ActivatedRoute) {
    this.id = route.params.map(p => +p['id']);

    this.locale = localeService.locale();
  }
}
