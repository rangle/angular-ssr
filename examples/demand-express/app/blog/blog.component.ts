import {Component} from '@angular/core';

import {ActivatedRoute} from '@angular/router';

import {Observable} from 'rxjs';

import 'rxjs/add/operator/map';

import {Blog} from './blog.model';
import {BlogService} from './blog.service';
import {LocaleService} from '../locale/locale.service';

@Component({
  selector: 'blog-component',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {
  private id: Observable<number>;

  private locale: Observable<string>;

  private blogs: Observable<Array<Blog>>;

  constructor(
    blogService: BlogService,
    localeService: LocaleService,
    route: ActivatedRoute
  ) {
    this.locale = localeService.locale();

    this.locale.subscribe(locale => this.blogs = blogService.load(locale));

    this.id = route.params.map(p => +p['id']);
  }
}
