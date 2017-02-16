import {ApplicationModule, Component, NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';

@Component({
  selector: 'application',
  template: `<div>Hello!</div>`
})
export class BasicInlineComponent {}

@NgModule({
  imports: [
    ApplicationModule,
    CommonModule,
  ],
  declarations: [BasicInlineComponent],
  bootstrap: [BasicInlineComponent],
})
export class BasicInlineApplication {}