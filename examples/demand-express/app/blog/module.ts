import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {HttpModule} from '@angular/http';

import {BlogService} from './service';
import {BlogComponent} from './blog.component';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    RouterModule.forChild([
      {path: ':id', component: BlogComponent}
    ])
  ],
  declarations: [BlogComponent],
  providers: [{provide: BlogService, useClass: BlogService}]
})
export class BlogModule {}
