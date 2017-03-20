import {Component, NgModule} from '@angular/core';

import {RouterModule} from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'basic-lazy-component',
  template: 'Lazy loaded component!'
})
export class BasicLazyLoadedComponent {}

@NgModule({
  imports: [
    RouterModule.forChild([{path: '', component: BasicLazyLoadedComponent}]),
  ],
  declarations: [
    BasicLazyLoadedComponent,
  ],
  exports: [RouterModule]
})
export class BasicLazyLoadedModule {}
