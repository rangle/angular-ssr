import {ApplicationModule, Component, NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';

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
    ApplicationModule,
    CommonModule,
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