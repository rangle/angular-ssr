import {NgModule, NgZone} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NavigationEnd, NavigationError, RouterModule, Router} from '@angular/router';
import {MaterialModule} from '@angular/material';

import {Observable} from 'rxjs';

import {prebootClient} from 'preboot/__build/src/browser/preboot_browser';

import {BlogModule} from './blog';
import {CookieModule} from './cookie';
import {LocaleModule} from './locale';
import {RootComponent} from './root.component';

@NgModule({
  bootstrap: [RootComponent],
  imports: [
    BlogModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CookieModule,
    LocaleModule,
    RouterModule.forRoot([
      {path: '', pathMatch: 'full', 'redirectTo': 'blog/1'},
      {path: 'blog', loadChildren: './blog/module.ts#BlogModule'},
    ]),
    MaterialModule.forRoot()
  ],
  declarations: [RootComponent]
})
export class RootModule {
  constructor(router: Router, zone: NgZone) {
    if (typeof prebootstrap === 'undefined') {
      return;
    }

    const finished = Observable.combineLatest(router.events, zone.onMicrotaskEmpty);

    const subscription = finished.subscribe(([event, stable]) => {
      if (stable === false) {
        return;
      }

      switch (true) {
        case event instanceof NavigationError:
        case event instanceof NavigationEnd:
          setImmediate(() => prebootClient().complete());

          subscription.unsubscribe();
          break;
        default:
          break;
      }
    });
  }
}

declare const prebootstrap;