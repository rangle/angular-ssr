import {Component} from '@angular/core';

import {ActivatedRoute} from '@angular/router';

import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'blog-component',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {
  private id: Observable<number>;

  constructor(route: ActivatedRoute) {
    this.id = route.params.map(p => +p['id']);
  }
}