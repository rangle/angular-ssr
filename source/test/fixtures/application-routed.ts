import {Component, NgModule} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';

import {RouterModule} from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'application',
  template: `<router-outlet></router-outlet>`
})
export class BasicRouterComponent {}

@Component({
  moduleId: module.id,
  template: `<div>Routed!<div>`
})
export class BasicRoutedRootComponent {}

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: '', pathMatch: 'full', redirectTo: '/one'},
      {path: 'one', component: BasicRoutedRootComponent},
    ])
  ],
  declarations: [
    BasicRoutedRootComponent,
    BasicRouterComponent
  ],
  bootstrap: [BasicRouterComponent]
})
export class BasicRoutedModule {}