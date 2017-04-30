import {Component} from '@angular/core';

import {ActivatedRoute} from '@angular/router';

import {Observable} from 'rxjs';

import 'rxjs/add/operator/map';

import {Blog} from './model';
import {BlogService} from './service';
import {LocaleService} from '../locale';

@Component({
  selector: 'blog-component',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {
  private locale: Observable<string>;

  private blogs: Observable<Array<Blog>>;

  constructor(
    private blogService: BlogService,
    localeService: LocaleService,
    route: ActivatedRoute
  ) {
    this.blogs = this.blogService.load('en-US');

    this.locale = localeService.locale();

    this.locale.subscribe(locale => this.update(locale));
  }

  private update(locale: string) {
    this.blogs = this.blogService.load(locale || 'en-US');
  }
}
