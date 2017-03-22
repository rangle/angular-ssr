import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {BlogComponent} from './blog.component';
import {RootComponent} from './root.component';
import {LocaleComponent} from './locale.component';

import {LocaleService} from './locale.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      {path: '', pathMatch: 'full', 'redirectTo': 'blog/1'},
      {path: 'blog/:id', component: BlogComponent},
    ]),
  ],
  declarations: [
    BlogComponent,
    RootComponent,
    LocaleComponent
  ],
  providers: [
    LocaleService
  ],
  bootstrap: [RootComponent]
})
export class AppModule {}
