import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {BlogComponent} from './blog.component';
import {RootComponent} from './root.component';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: '', pathMatch: 'full', 'redirectTo': 'blog/1'},
      {path: 'blog/:id', component: BlogComponent},
    ]),
  ],
  declarations: [
    BlogComponent,
    RootComponent
  ],
  bootstrap: [RootComponent]
})
export class AppModule {}
