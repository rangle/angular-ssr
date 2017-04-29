import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NavigationEnd, NavigationError, RouterModule, Router} from '@angular/router';
import {MaterialModule} from '@angular/material';

import {BlogComponent, BlogService} from './blog';
import {LocaleComponent, LocaleService} from './locale';
import {RootComponent} from './root.component';

import {CookieService} from './cookie/cookie.service';

import {prebootClient} from 'preboot/__build/src/browser/preboot_browser';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot([
      {path: '', pathMatch: 'full', 'redirectTo': 'blog/1'},
      {path: 'blog/:id', component: BlogComponent},
    ]),
    MaterialModule.forRoot(),
  ],
  declarations: [
    BlogComponent,
    RootComponent,
    LocaleComponent
  ],
  providers: [
    BlogService,
    CookieService,
    LocaleService
  ],
  bootstrap: [RootComponent]
})
export class AppModule {
  constructor(router: Router) {
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
