import {Component, NgModule} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';

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
