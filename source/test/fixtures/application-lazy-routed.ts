import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'application',
  template: `<router-outlet></router-outlet>`
})
export class BasicLazyRouterComponent {}

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: '', pathMatch: 'full', redirectTo: '/one'},
      {path: 'one', loadChildren: 'source/test/fixtures/application-lazy-module#BasicLazyLoadedModule'},
    ])
  ],
  declarations: [
    BasicLazyRouterComponent
  ],
  bootstrap: [BasicLazyRouterComponent]
})
export class BasicLazyRoutedModule {}
