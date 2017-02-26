import {ApplicationModule, Component, NgModule} from '@angular/core/index';

import {CommonModule} from '@angular/common/index';

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
export class BasicInlineModule {}