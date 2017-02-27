import {Component, NgModule} from '@angular/core/index';

import {BrowserModule} from '@angular/platform-browser/index';

@Component({
  selector: 'application',
  template: `<div>Hello!</div>`
})
export class BasicInlineComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [BasicInlineComponent],
  bootstrap: [BasicInlineComponent],
})
export class BasicInlineModule {}