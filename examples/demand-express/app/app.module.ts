import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NavigationEnd, NavigationError, RouterModule, Router} from '@angular/router';
import {MdSelectModule} from '@angular/material';

import {BlogComponent} from './blog.component';
import {RootComponent} from './root.component';
import {LocaleComponent} from './locale.component';

import {CookieService} from './cookie.service';
import {LocaleService} from './locale.service';

const {prebootClient} = require('preboot/__build/src/browser/preboot_browser');

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
    CookieService,
    LocaleService
  ],
  bootstrap: [RootComponent]
})
export class AppModule {
  constructor(router: Router) {
    if (typeof prebootClient === 'undefined') {
      return;
    }

    const subscription = router.events.subscribe(event => {
      switch (true) {
        case event instanceof NavigationError:
        case event instanceof NavigationEnd:
          prebootClient().complete();
          subscription.unsubscribe();
          break;
        default:
          break;
      }
    });
  }
}
