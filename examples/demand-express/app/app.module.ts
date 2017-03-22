import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {MdSelectModule} from '@angular/material';

import {BlogComponent} from './blog.component';
import {RootComponent} from './root.component';
import {LocaleComponent} from './locale.component';

import {LocaleService} from './locale.service';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot([
      {path: '', pathMatch: 'full', 'redirectTo': 'blog/1'},
      {path: 'blog/:id', component: BlogComponent},
    ]),
    MdSelectModule
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
